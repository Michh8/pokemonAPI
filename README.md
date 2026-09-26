# PokéAPI Query Lab

Actividad práctica de optimización de transferencia de datos con Next.js App Router,
React Server Components y TanStack Query v5.

## Stack

- Next.js 16+ con App Router
- React Server Components
- TanStack Query v5
- TypeScript estricto
- PokéAPI

## Funcionalidades implementadas

- Página principal como Server Component.
- Prefetch en servidor de una lista inicial de 50 Pokémon.
- Transferencia de caché con `dehydrate` y `<HydrationBoundary>`.
- Paginación de 50 Pokémon por página.
- Tarjetas con nombre, imagen y tipos.
- `prefetchQuery` en `onMouseEnter` y `onFocus` para precargar el detalle.
- Ruta dinámica `/pokemon/[name]`.
- Página de detalle con stats, tipos, habilidades, sprites y cadena evolutiva.
- Estados de carga y error en componentes cliente.

## Estrategia de caché

La configuración central está en `lib/query-client.ts`.

- `staleTime`: `24 * 60 * 60 * 1000` ms, equivalente a 24 horas. Durante ese periodo,
  TanStack Query considera los datos frescos y evita refetches innecesarios al navegar.
- `gcTime`: `7 * 24 * 60 * 60 * 1000` ms. Los datos inactivos permanecen en memoria
  hasta 7 días antes de ser recolectados, favoreciendo navegaciones rápidas durante la sesión.
- El servidor usa `prefetchQuery` y `dehydrate` para enviar la primera página ya resuelta.
- El cliente reutiliza esa caché con las mismas `queryKey`, evitando una segunda petición inicial.
- En hover sobre una tarjeta se ejecuta `prefetchQuery` del detalle, de modo que la ruta dinámica
  puede mostrar los datos instantáneamente si el usuario hace clic después.

## Comandos

```bash
npm install
npm run dev
npm run build
```
