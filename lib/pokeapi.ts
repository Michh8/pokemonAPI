const API_BASE_URL = "https://pokeapi.co/api/v2";
const PAGE_REVALIDATE_SECONDS = 24 * 60 * 60;

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export type NamedApiResource = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
};

export type PokemonStat = {
  name: string;
  value: number;
};

export type PokemonSprites = {
  frontDefault: string | null;
  backDefault: string | null;
  officialArtwork: string | null;
  shiny: string | null;
};

export type PokemonSummary = {
  id: number;
  name: string;
  image: string | null;
  types: string[];
};

export type PokemonPage = {
  count: number;
  nextOffset: number | null;
  previousOffset: number | null;
  limit: number;
  offset: number;
  results: PokemonSummary[];
};

export type PokemonDetail = PokemonSummary & {
  height: number;
  weight: number;
  baseExperience: number | null;
  stats: PokemonStat[];
  abilities: string[];
  sprites: PokemonSprites;
  evolutionChain: PokemonSummary[];
};

type PokemonApiDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  sprites: {
    front_default: string | null;
    back_default: string | null;
    front_shiny: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  stats: Array<{
    base_stat: number;
    stat: NamedApiResource;
  }>;
  types: Array<{
    type: NamedApiResource;
  }>;
  abilities: Array<{
    ability: NamedApiResource;
  }>;
};

type PokemonSpecies = {
  evolution_chain: {
    url: string;
  };
};

type EvolutionChainNode = {
  species: NamedApiResource;
  evolves_to: EvolutionChainNode[];
};

type EvolutionChainResponse = {
  chain: EvolutionChainNode;
};

async function apiFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: PAGE_REVALIDATE_SECONDS },
  } satisfies NextFetchInit);

  if (!response.ok) {
    throw new Error(`PokéAPI respondió ${response.status} para ${url}`);
  }

  return response.json() as Promise<T>;
}

function getImage(detail: PokemonApiDetail) {
  return (
    detail.sprites.other?.["official-artwork"]?.front_default ??
    detail.sprites.front_default ??
    null
  );
}

function toSummary(detail: PokemonApiDetail): PokemonSummary {
  return {
    id: detail.id,
    name: detail.name,
    image: getImage(detail),
    types: detail.types.map(({ type }) => type.name),
  };
}

function parseOffset(url: string | null) {
  if (!url) return null;
  const parsed = new URL(url);
  const offset = parsed.searchParams.get("offset");
  return offset ? Number(offset) : null;
}

function flattenEvolutionChain(node: EvolutionChainNode): string[] {
  return [
    node.species.name,
    ...node.evolves_to.flatMap((child) => flattenEvolutionChain(child)),
  ];
}

export async function fetchPokemonCore(nameOrId: string | number) {
  return apiFetch<PokemonApiDetail>(`${API_BASE_URL}/pokemon/${nameOrId}`);
}

export async function fetchPokemonPage({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}): Promise<PokemonPage> {
  const list = await apiFetch<PokemonListResponse>(
    `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
  );

  const details = await Promise.all(
    list.results.map((pokemon) => fetchPokemonCore(pokemon.name)),
  );

  return {
    count: list.count,
    nextOffset: parseOffset(list.next),
    previousOffset: parseOffset(list.previous),
    limit,
    offset,
    results: details.map(toSummary),
  };
}

export async function fetchPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
  const detail = await fetchPokemonCore(nameOrId);
  const species = await apiFetch<PokemonSpecies>(`${API_BASE_URL}/pokemon-species/${detail.id}`);
  const evolution = await apiFetch<EvolutionChainResponse>(species.evolution_chain.url);
  const evolutionNames = flattenEvolutionChain(evolution.chain);
  const evolutionDetails = await Promise.all(
    evolutionNames.map((pokemonName) => fetchPokemonCore(pokemonName)),
  );

  return {
    ...toSummary(detail),
    height: detail.height,
    weight: detail.weight,
    baseExperience: detail.base_experience,
    stats: detail.stats.map(({ base_stat, stat }) => ({
      name: stat.name,
      value: base_stat,
    })),
    abilities: detail.abilities.map(({ ability }) => ability.name),
    sprites: {
      frontDefault: detail.sprites.front_default,
      backDefault: detail.sprites.back_default,
      officialArtwork: detail.sprites.other?.["official-artwork"]?.front_default ?? null,
      shiny: detail.sprites.front_shiny,
    },
    evolutionChain: evolutionDetails.map(toSummary),
  };
}

export function formatPokemonName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
