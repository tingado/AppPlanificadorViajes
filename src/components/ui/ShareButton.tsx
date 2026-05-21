"use client";
import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  const { selectedDestination, activePins, tripDays, generatedItinerary } = useTravelStore();

  if (!selectedDestination) return null;

  const buildUrl = () => {
    const params = new URLSearchParams({
      dest: selectedDestination.id,
      days: String(tripDays),
      pins: activePins.map(p => p.id).join(','),
    });
    return `${location.origin}${location.pathname}?${params.toString()}`;
  };

  const buildText = () => {
    const lines = [`✈ Luna de Miel — ${selectedDestination.flag} ${selectedDestination.country} · ${tripDays} días`];
    if (activePins.length > 0) {
      lines.push(`📍 ${activePins.map(p => p.name).join(', ')}`);
    }
    if (generatedItinerary.length > 0) {
      const totalUSD = generatedItinerary.reduce((s, d) => s + d.estimatedCostUSD, 0);
      lines.push(`💰 ~$${Math.round(totalUSD)} USD · 2 personas`);
    }
    return lines.join('\n');
  };

  const handleShare = async () => {
    const url = buildUrl();
    const text = buildText();

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Luna de Miel Planner', text, url });
      } catch {
        // User cancelled — no action needed
      }
      return;
    }

    // Fallback: copy URL to clipboard
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-700 rounded-lg px-3 py-1.5 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
    >
      {copied ? '✅ Copiado!' : '🔗 Compartir'}
    </button>
  );
}
