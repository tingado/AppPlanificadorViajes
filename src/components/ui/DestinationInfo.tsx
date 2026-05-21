"use client";

import { useTravelStore } from "@/store/useTravelStore";

export default function DestinationInfo() {
  const { selectedDestination } = useTravelStore();
  if (!selectedDestination) return null;

  const { visaInfo, bestMonths, climate, travelTips } = selectedDestination;
  if (!visaInfo && !bestMonths && !climate && !travelTips?.length) return null;

  return (
    <div className="rounded-xl border border-brand-100 dark:border-brand-900/40 bg-brand-50/40 dark:bg-brand-900/10 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-1.5">
        🌏 Info del Destino
      </h3>

      {visaInfo && (
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">🛂 Visa</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{visaInfo}</p>
        </div>
      )}

      {bestMonths && (
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">📅 Mejor época</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{bestMonths}</p>
        </div>
      )}

      {climate && (
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">🌡️ Clima</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{climate}</p>
        </div>
      )}

      {travelTips && travelTips.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">💡 Tips de viaje</p>
          <ul className="space-y-1">
            {travelTips.map((tip) => (
              <li key={tip} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                <span className="text-brand-400 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
