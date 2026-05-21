"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
      <span className="text-5xl mb-4">😕</span>
      <h2 className="text-lg font-bold text-gray-800 mb-2">Algo salió mal</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Ocurrió un error inesperado. Tus datos locales están seguros.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-purple-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-purple-700 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
