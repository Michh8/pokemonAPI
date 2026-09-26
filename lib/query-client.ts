import { QueryClient } from "@tanstack/react-query";

export const CACHE_TIMES = {
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
} as const;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_TIMES.staleTime,
        gcTime: CACHE_TIMES.gcTime,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  });
}
