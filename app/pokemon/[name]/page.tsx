import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Link from "next/link";
import { PokemonDetailClient } from "@/components/pokemon-detail-client";
import { fetchPokemonDetail, formatPokemonName } from "@/lib/pokeapi";
import { createQueryClient } from "@/lib/query-client";
import { pokemonKeys } from "@/lib/query-keys";

type PokemonDetailPageProps = {
  params: Promise<{
    name: string;
  }>;
};

export async function generateMetadata({ params }: PokemonDetailPageProps) {
  const { name } = await params;

  return {
    title: `${formatPokemonName(name)} | Pokédex`,
    description: `Detalle, stats, habilidades y evolución de ${formatPokemonName(name)}.`,
  };
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { name } = await params;
  const queryClient = createQueryClient();

  await queryClient.prefetchQuery({
    queryKey: pokemonKeys.detail(name),
    queryFn: () => fetchPokemonDetail(name),
  });

  return (
    <main className="page-shell detail-shell">
      <Link className="back-link" href="/">
        Volver a la lista
      </Link>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PokemonDetailClient name={name} />
      </HydrationBoundary>
    </main>
  );
}
