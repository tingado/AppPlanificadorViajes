"use client";

import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { Destination } from "@/types";

function getSeasonStatus(dest: Destination, month: number): { label: string; color: string } {
  if (!dest.goodMonths || dest.goodMonths.length === 12) return { label: '✅ Todo el año', color: 'text-green-600 dark:text-green-400' };
  if (dest.avoidMonths?.includes(month)) return { label: '⚠️ Temporada de lluvia', color: 'text-red-500 dark:text-red-400' };
  if (dest.goodMonths.includes(month)) return { label: '✅ Temporada ideal', color: 'text-green-600 dark:text-green-400' };
  return { label: '⚡ Temporada variable', color: 'text-amber-600 dark:text-amber-400' };
}

export default function DestinationInfo() {
  const [open, setOpen] = useState(false);
  const { selectedDestination, tripDate } = useTravelStore();
  if (!selectedDestination) return null;

  const { visaInfo, bestMonths, climate, travelTips, freeDayHints, romanticHighlights } = selectedDestination;
  if (!visaInfo && !bestMonths && !climate && !travelTips?.length && !freeDayHints?.length && !romanticHighlights?.length) return null;

  const checkMonth = tripDate
    ? new Date(tripDate + 'T12:00:00').getMonth() + 1
    : new Date().getMonth() + 1;
  const season = getSeasonStatus(selectedDestination, checkMonth);

  return (
    <div className="rounded-xl border border-brand-100 dark:border-brand-900/40 bg-brand-50/40 dark:bg-brand-900/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-1.5">
          🌏 Info del Destino
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${season.color}`}>{season.label}</span>
          <span className="text-gray-400 dark:text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-brand-100 dark:border-brand-900/40 pt-3">
          {romanticHighlights && romanticHighlights.length > 0 && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">💑 Experiencias románticas imperdibles</p>
              {romanticHighlights.map((h, i) => (
                <p key={i} className="text-xs text-rose-700 dark:text-rose-300 leading-snug">{h}</p>
              ))}
            </div>
          )}
          {visaInfo && (
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">🛂 Visa</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{visaInfo}</p>
            </div>
          )}

          {/* Visual month calendar */}
          {(selectedDestination.goodMonths || selectedDestination.avoidMonths) && (() => {
            const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            return (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">📅 Calendario de temporadas</p>
                <div className="grid grid-cols-6 gap-1">
                  {MONTHS.map((m, i) => {
                    const monthNum = i + 1;
                    const isGood = selectedDestination.goodMonths?.includes(monthNum);
                    const isAvoid = selectedDestination.avoidMonths?.includes(monthNum);
                    const isCurrent = monthNum === checkMonth;
                    let bg = 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
                    if (isAvoid) bg = 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400';
                    else if (isGood) bg = 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400';
                    return (
                      <div
                        key={m}
                        className={`rounded-md px-1 py-1 text-center text-[10px] font-semibold ${bg} ${isCurrent ? 'ring-2 ring-brand-400 ring-offset-1' : ''}`}
                      >
                        {m}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 text-[10px] text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400 inline-block" />Ideal</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-300 dark:bg-gray-600 inline-block" />Variable</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />Evitar</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm border-2 border-brand-400 inline-block" />Hoy</span>
                </div>
              </div>
            );
          })()}

          {bestMonths && (
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">🌤 Resumen de temporadas</p>
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

          {freeDayHints && freeDayHints.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">🌅 Ideas para días libres</p>
              <ul className="space-y-1">
                {freeDayHints.map((hint) => (
                  <li key={hint} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                    <span className="text-amber-400 shrink-0">★</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
