"use client";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", background: "#fff" }}>
      <h2 style={{ color: "red" }}>Error en la aplicación</h2>
      <p><strong>Mensaje:</strong> {error.message}</p>
      {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
      <pre style={{ background: "#f0f0f0", padding: "1rem", overflow: "auto", fontSize: "11px" }}>
        {error.stack}
      </pre>
    </div>
  );
}
