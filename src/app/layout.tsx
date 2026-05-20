import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luna de Miel Planner",
  description: "Planificador interactivo de viajes para parejas",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#c026d3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
