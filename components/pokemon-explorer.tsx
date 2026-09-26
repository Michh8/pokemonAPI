"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  fetchPokemonDetail,
  fetchPokemonPage,
  formatPokemonName,
  type PokemonSummary,
} from "@/lib/pokeapi";
import { CACHE_TIMES } from "@/lib/query-client";
import { pokemonKeys } from "@/lib/query-keys";

type PokemonExplorerProps = {
  initialLimit: number;
  initialOffset: number;
};

export function PokemonExplorer({ initialLimit, initialOffset }: PokemonExplorerProps) {
  const [offset, setOffset] = useState(initialOffset);
  const queryClient = useQueryClient();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: pokemonKeys.page(offset, initialLimit),
    queryFn: () => fetchPokemonPage({ limit: initialLimit, offset }),
    placeholderData: (previousData) => previousData,
  });

  function prefetchPokemon(pokemon: PokemonSummary) {
    void queryClient.prefetchQuery({
      queryKey: pokemonKeys.detail(pokemon.name),
      queryFn: () => fetchPokemonDetail(pokemon.name),
      staleTime: CACHE_TIMES.staleTime,
      gcTime: CACHE_TIMES.gcTime,
    });
  }

  if (isPending) {
    return <GridMessage title="Cargando Pokémon" detail="Preparando la primera página." />;
  }

  if (isError) {
    return (
      <GridMessage
        title="No se pudo cargar la Pokédex"
        detail={error instanceof Error ? error.message : "Intenta de nuevo en unos segundos."}
      />
    );
  }

  return (
    <section className="dex-section" aria-label="Lista de Pokémon">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Página {Math.floor(offset / initialLimit) + 1}</p>
          <h2>50 Pokémon por consulta</h2>
        </div>
        <div className="pager" aria-label="Paginación">
          <button
            type="button"
            onClick={() => data.previousOffset !== null && setOffset(data.previousOffset)}
            disabled={data.previousOffset === null || isFetching}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => data.nextOffset !== null && setOffset(data.nextOffset)}
            disabled={data.nextOffset === null || isFetching}
          >
            Siguiente
          </button>
        </div>
      </div>

      {isFetching ? <p className="fetching-indicator">Actualizando caché...</p> : null}

      <div className="pokemon-grid">
        {data.results.map((pokemon) => (
          <Link
            className="pokemon-card"
            href={`/pokemon/${pokemon.name}`}
            key={pokemon.id}
            onFocus={() => prefetchPokemon(pokemon)}
            onMouseEnter={() => prefetchPokemon(pokemon)}
          >
            <span className="pokemon-number">#{pokemon.id.toString().padStart(4, "0")}</span>
            <div className="pokemon-art">
              {pokemon.image ? (
                <img src={pokemon.image} alt={formatPokemonName(pokemon.name)} loading="lazy" />
              ) : (
                <span>Sin imagen</span>
              )}
            </div>
            <div className="card-footer">
              <h3>{formatPokemonName(pokemon.name)}</h3>
              <div className="type-list">
                {pokemon.types.map((type) => (
                  <span className={`type-pill type-${type}`} key={type}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function GridMessage({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="message-panel" role="status">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}
