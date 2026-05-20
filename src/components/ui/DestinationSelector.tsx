"use client";

import { destinations } from "@/data/destinations";
import { useTravelStore } from "@/store/useTravelStore";

const flags: Record<string, string> = {
  JP: "🇯🇵",
  ID: "🇮🇩",
  SG: "🇸🇬",
};

export default function DestinationSelector() {
  const { selectedDestination, setSelectedDestination } = useTravelStore();

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Destino
      </label>
      <div className="relative">
        <select
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-sm"
          value={selectedDestination?.id ?? ""}
          onChange={(e) => {
            const dest = destinations.find((d) => d.id === e.target.value) ?? null;
            setSelectedDestination(dest);
          }}
        >
          <option value="">Elige tu destino de luna de miel…</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {flags[d.countryCode] ?? ""} {d.country}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          ▾
        </span>
      </div>
    </div>
  );
}
