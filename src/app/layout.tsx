import type { Metadata, Viewport } from "next";
import "./globals.css";
import StoreHydration from "@/components/ui/StoreHydration";

export const metadata: Metadata = {
  title: "Luna de Miel Planner",
  description: "Planificador interactivo de viajes para parejas",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#c026d3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <StoreHydration />
        {children}
      </body>
    </html>
  );
}
