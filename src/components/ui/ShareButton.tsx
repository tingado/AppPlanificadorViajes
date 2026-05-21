"use client";
import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  const { selectedDestination, activePins, tripDays } = useTravelStore();

  if (!selectedDestination) return null;

  const handleShare = () => {
    const params = new URLSearchParams({
      dest: selectedDestination.id,
      days: String(tripDays),
      pins: activePins.map(p => p.id).join(','),
    });
    const url = `${location.origin}${location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 border border-brand-300 rounded-lg px-3 py-1.5 hover:bg-brand-50 transition-colors"
    >
      {copied ? '✅ Copiado!' : '🔗 Compartir'}
    </button>
  );
}
