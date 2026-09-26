import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PokemonExplorer } from "@/components/pokemon-explorer";
import { fetchPokemonPage } from "@/lib/pokeapi";
import { createQueryClient } from "@/lib/query-client";
import { pokemonKeys } from "@/lib/query-keys";

const INITIAL_LIMIT = 50;
const INITIAL_OFFSET = 0;

export default async function Home() {
  const queryClient = createQueryClient();

  await queryClient.prefetchQuery({
    queryKey: pokemonKeys.page(INITIAL_OFFSET, INITIAL_LIMIT),
    queryFn: () => fetchPokemonPage({ limit: INITIAL_LIMIT, offset: INITIAL_OFFSET }),
  });

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Next.js 16 + RSC + TanStack Query v5</p>
          <h1>Pokédex con transferencia de datos optimizada</h1>
        </div>
        <p>
          Lista renderizada desde servidor, caché hidratada en cliente y detalles precargados al
          pasar el mouse por cada tarjeta.
        </p>
      </section>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PokemonExplorer initialLimit={INITIAL_LIMIT} initialOffset={INITIAL_OFFSET} />
      </HydrationBoundary>
    </main>
  );
}
