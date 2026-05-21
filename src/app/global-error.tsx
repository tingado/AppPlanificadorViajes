"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "320px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
          <h2 style={{ color: "#1f2937", fontWeight: 700, marginBottom: "0.5rem" }}>Error inesperado</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "1.5rem" }}>
            La aplicación encontró un problema. Por favor recarga la página.
          </p>
          <button
            onClick={reset}
            style={{ background: "#9333ea", color: "white", border: "none", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  );
}
