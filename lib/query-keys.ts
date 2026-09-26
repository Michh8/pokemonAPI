export const pokemonKeys = {
  all: ["pokemon"] as const,
  page: (offset: number, limit: number) =>
    [...pokemonKeys.all, "page", { offset, limit }] as const,
  detail: (name: string) => [...pokemonKeys.all, "detail", name.toLowerCase()] as const,
};
