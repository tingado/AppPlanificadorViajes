"use client";

import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { formatDuration } from "@/utils/geo";
import ExportButton from "@/components/ui/ExportButton";
import ShareButton from "@/components/ui/ShareButton";

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function fmtDate(date: Date) {
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export default function ItineraryView() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedNoteDay, setExpandedNoteDay] = useState<number | null>(null);

  const {
    generatedItinerary,
    selectedDestination,
    currencyRates,
    itineraryOutdated,
    generateItineraryAction,
    setActiveTab,
    tripDate,
    dayNotes,
    setDayNote,
  } = useTravelStore();

  if (!selectedDestination || generatedItinerary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500">
        <span className="text-4xl mb-3">📅</span>
        <p className="text-sm dark:text-gray-400">
          Selecciona atracciones y genera el itinerario desde la pestaña{" "}
          <button
            onClick={() => setActiveTab("attractions")}
            className="text-brand-500 font-semibold underline underline-offset-2"
          >
            Atractivos
          </button>
        </p>
      </div>
    );
  }

  const code = selectedDestination.currencyCode;
  const localRate = currencyRates[`USD_TO_${code}`] ?? 1;
  const totalUSD = generatedItinerary.reduce((s, d) => s + d.estimatedCostUSD, 0);
  const totalCLP = totalUSD * currencyRates.USD_TO_CLP;
  const totalLocal = totalUSD * localRate;

  // Compute real dates if tripDate is set
  const startDate = tripDate ? new Date(tripDate + 'T12:00:00') : null;
  const getDayDate = (dayNum: number): Date | null => {
    if (!startDate) return null;
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayNum - 1);
    return d;
  };

  // Calendar: figure out the weekday offset of day 1 (0=Mon … 6=Sun)
  const day1Date = getDayDate(1);
  const calendarOffset = day1Date
    ? ((day1Date.getDay() + 6) % 7) // convert Sun=0 to Mon=0
    : 0;

  return (
    <div className="space-y-3 itinerary-print-zone">
      {/* Outdated banner */}
      {itineraryOutdated && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            ⚠️ Cambios detectados — el itinerario puede estar desactualizado
          </p>
          <button
            onClick={generateItineraryAction}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-600 rounded-lg px-2 py-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 shrink-0"
          >
            Regenerar
          </button>
        </div>
      )}

      {/* Export button + view toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 text-xs font-medium ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
          >
            ☰ Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-2 py-1 text-xs font-medium ${viewMode === 'calendar' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
          >
            📅 Calendario
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <ShareButton />
          <ExportButton />
        </div>
      </div>

      {/* Cost summary card */}
      <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white shadow">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-2">
          Costo total estimado para 2 personas
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold">{fmt(totalCLP)}</p>
            <p className="text-xs opacity-75">CLP</p>
          </div>
          <div>
            <p className="text-lg font-bold">${fmt(totalUSD)}</p>
            <p className="text-xs opacity-75">USD</p>
          </div>
          <div>
            <p className="text-lg font-bold">{fmt(totalLocal)}</p>
            <p className="text-xs opacity-75">{code}</p>
          </div>
        </div>
      </div>

      {/* Day cards — Lista */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {generatedItinerary.map((day) => {
            const dayDate = getDayDate(day.day);
            const isNoteOpen = expandedNoteDay === day.day;
            const userNote = dayNotes[day.day] ?? '';
            return (
              <div
                key={day.day}
                className={`itinerary-day rounded-xl border ${
                  day.isTransitDay
                    ? "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          day.isTransitDay
                            ? "bg-amber-400 text-white"
                            : "bg-brand-500 text-white"
                        }`}
                      >
                        {day.day}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {day.isTransitDay
                              ? "Día de traslado"
                              : day.attractions[0]?.name ?? "Día libre"}
                          </p>
                          {dayDate && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                              {fmtDate(dayDate)}
                            </span>
                          )}
                        </div>
                        {day.travelTimeHours != null && day.travelTimeHours > 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            ✈ {formatDuration(day.travelTimeHours)} de viaje
                          </p>
                        )}
                        {day.isTransitDay && day.flightCostUSD != null && day.flightCostUSD > 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                            ✈ Vuelo estimado: ${fmt(day.flightCostUSD)} USD
                          </p>
                        )}
                        {day.notes && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{day.notes}</p>
                        )}
                        {userNote && !isNoteOpen && (
                          <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5 italic">
                            &ldquo;{userNote}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {fmt(day.estimatedCostUSD * currencyRates.USD_TO_CLP)} CLP
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">${fmt(day.estimatedCostUSD)} USD</p>
                      <button
                        onClick={() => setExpandedNoteDay(isNoteOpen ? null : day.day)}
                        className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-brand-500 mt-1"
                      >
                        {isNoteOpen ? '▲ cerrar' : '✏️ nota'}
                      </button>
                    </div>
                  </div>
                  {/* Inline note editor */}
                  {isNoteOpen && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <textarea
                        rows={2}
                        value={userNote}
                        onChange={(e) => setDayNote(day.day, e.target.value)}
                        placeholder="Agrega una nota personal para este día..."
                        className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendario */}
      {viewMode === 'calendar' && (
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-0.5">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
            {/* Padding cells before day 1 */}
            {Array.from({ length: calendarOffset }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {generatedItinerary.map((day) => {
              const dayDate = getDayDate(day.day);
              return (
                <div
                  key={day.day}
                  className={`rounded-lg p-1 min-h-[52px] flex flex-col items-center ${
                    day.isTransitDay
                      ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className={`text-xs font-bold ${day.isTransitDay ? 'text-amber-600 dark:text-amber-400' : 'text-brand-600'}`}>
                    {day.day}
                  </span>
                  {dayDate && (
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 leading-tight">
                      {dayDate.getDate()}/{dayDate.getMonth() + 1}
                    </span>
                  )}
                  <span className="text-[9px] text-gray-600 dark:text-gray-400 text-center leading-tight mt-0.5 line-clamp-2">
                    {day.isTransitDay ? '✈️' : (day.attractions[0]?.name.split(' ')[0] ?? '—')}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            {startDate ? `Desde el ${fmtDate(startDate)}` : 'Selecciona fecha de inicio para ver fechas reales'}
          </p>
        </div>
      )}
    </div>
  );
}
