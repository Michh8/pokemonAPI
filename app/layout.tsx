import type { Metadata } from "next";
import { QueryProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokéAPI Query Lab",
  description:
    "Optimización de transferencia de datos con Next.js, React Server Components y TanStack Query.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
