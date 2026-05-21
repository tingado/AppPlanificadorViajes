"use client";

import { destinations } from "@/data/destinations";
import { useTravelStore } from "@/store/useTravelStore";

export default function DestinationSelector() {
  const { selectedDestination, setSelectedDestination, setActiveTab } = useTravelStore();

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        Destino
      </label>
      <div className="relative">
        {selectedDestination && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg leading-none">
            {selectedDestination.flag}
          </span>
        )}
        <select
          className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 text-sm text-gray-800 dark:text-gray-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-sm ${selectedDestination ? 'pl-9 pr-8' : 'px-3 pr-8'}`}
          value={selectedDestination?.id ?? ""}
          onChange={(e) => {
            const dest = destinations.find((d) => d.id === e.target.value) ?? null;
            setSelectedDestination(dest);
            if (dest) setActiveTab("attractions");
          }}
        >
          <option value="">Elige tu destino de luna de miel…</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.flag ?? ""} {d.country}
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
