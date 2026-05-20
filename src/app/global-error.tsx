"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2 style={{ color: "red" }}>Error global: {error.message}</h2>
        <pre style={{ background: "#f0f0f0", padding: "1rem", overflow: "auto", fontSize: "11px" }}>
          {error.stack}
        </pre>
      </body>
    </html>
  );
}
