"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchPokemonDetail, formatPokemonName } from "@/lib/pokeapi";
import { pokemonKeys } from "@/lib/query-keys";

export function PokemonDetailClient({ name }: { name: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: pokemonKeys.detail(name),
    queryFn: () => fetchPokemonDetail(name),
  });

  if (isPending) {
    return (
      <section className="message-panel" role="status">
        <h1>Cargando detalle</h1>
        <p>Buscando stats, habilidades y evolución.</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="message-panel" role="alert">
        <h1>No se pudo cargar el Pokémon</h1>
        <p>{error instanceof Error ? error.message : "Intenta regresar a la lista."}</p>
      </section>
    );
  }

  const maxStat = Math.max(...data.stats.map((stat) => stat.value), 100);
  const spriteEntries = [
    ["Artwork", data.sprites.officialArtwork],
    ["Frente", data.sprites.frontDefault],
    ["Espalda", data.sprites.backDefault],
    ["Shiny", data.sprites.shiny],
  ] as const;

  return (
    <article className="detail-layout">
      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">#{data.id.toString().padStart(4, "0")}</p>
          <h1>{formatPokemonName(data.name)}</h1>
          <div className="type-list">
            {data.types.map((type) => (
              <span className={`type-pill type-${type}`} key={type}>
                {type}
              </span>
            ))}
          </div>
          <dl className="facts-grid">
            <div>
              <dt>Altura</dt>
              <dd>{(data.height / 10).toFixed(1)} m</dd>
            </div>
            <div>
              <dt>Peso</dt>
              <dd>{(data.weight / 10).toFixed(1)} kg</dd>
            </div>
            <div>
              <dt>Experiencia base</dt>
              <dd>{data.baseExperience ?? "N/D"}</dd>
            </div>
          </dl>
        </div>
        <div className="detail-art">
          {data.image ? (
            <img src={data.image} alt={formatPokemonName(data.name)} />
          ) : (
            <span>Sin imagen</span>
          )}
        </div>
      </section>

      <section className="detail-panel">
        <h2>Stats</h2>
        <div className="stats-list">
          {data.stats.map((stat) => (
            <div className="stat-row" key={stat.name}>
              <span>{formatPokemonName(stat.name)}</span>
              <div className="stat-track">
                <div style={{ width: `${(stat.value / maxStat) * 100}%` }} />
              </div>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-panel">
        <h2>Habilidades</h2>
        <div className="ability-list">
          {data.abilities.map((ability) => (
            <span key={ability}>{formatPokemonName(ability)}</span>
          ))}
        </div>
      </section>

      <section className="detail-panel">
        <h2>Cadena evolutiva</h2>
        <div className="evolution-list">
          {data.evolutionChain.map((pokemon) => (
            <Link href={`/pokemon/${pokemon.name}`} key={pokemon.id}>
              {pokemon.image ? (
                <img src={pokemon.image} alt={formatPokemonName(pokemon.name)} />
              ) : null}
              <span>{formatPokemonName(pokemon.name)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="detail-panel">
        <h2>Sprites</h2>
        <div className="sprite-grid">
          {spriteEntries.map(([label, sprite]) => (
            <div className="sprite-tile" key={label}>
              {sprite ? <img src={sprite} alt={`${label} de ${formatPokemonName(data.name)}`} /> : null}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
