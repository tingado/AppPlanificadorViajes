"use client";

import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { formatDuration } from "@/utils/geo";
import ExportButton from "@/components/ui/ExportButton";
import ShareButton from "@/components/ui/ShareButton";
import { defaultCurrencyRates } from "@/data/destinations";

function getRate(rates: Record<string, number>, code: string): number {
  const key = `USD_TO_${code}`;
  return rates[key] ?? (defaultCurrencyRates as Record<string, number>)[key] ?? 1;
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function fmtDate(date: Date) {
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export default function ItineraryView() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedNoteDay, setExpandedNoteDay] = useState<number | null>(null);
  const [expandedAttrNote, setExpandedAttrNote] = useState<string | null>(null);
  const [jumpDay, setJumpDay] = useState('');

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
    attractionNotes,
    setAttractionNote,
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
  const localRate = getRate(currencyRates as Record<string, number>, code);
  const totalUSD = generatedItinerary.reduce((s, d) => s + d.estimatedCostUSD, 0);
  const totalCLP = totalUSD * currencyRates.USD_TO_CLP;
  const totalLocal = totalUSD * localRate;

  const activityDays = generatedItinerary.filter(d => !d.isTransitDay && d.attractions.length > 0).length;
  const freeDays = generatedItinerary.filter(d => !d.isTransitDay && d.attractions.length === 0).length;
  const transitDays = generatedItinerary.filter(d => d.isTransitDay).length;

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
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
            Costo estimado · 2 personas
          </p>
          {startDate && (() => {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + generatedItinerary.length - 1);
            return (
              <p className="text-[10px] opacity-70 text-right">
                {fmtDate(startDate)} → {fmtDate(endDate)}
              </p>
            );
          })()}
        </div>
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
        <p className="text-[10px] opacity-60 text-center mt-1.5">
          ~${fmt(totalUSD / 2)} USD por persona
        </p>
        {/* Stats pills */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {activityDays > 0 && <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5">{activityDays} actividad</span>}
          {freeDays > 0 && <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5">{freeDays} libre</span>}
          {transitDays > 0 && <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5">{transitDays} traslado</span>}
        </div>
        {/* Trip timeline: group consecutive days by type/attraction */}
        {(() => {
          type Seg = { label: string; count: number; transit: boolean };
          const segs: Seg[] = [];
          generatedItinerary.forEach(day => {
            const label = day.isTransitDay ? '✈️' : day.attractions[0]?.name.split(' ')[0] ?? '—';
            const transit = day.isTransitDay;
            const last = segs[segs.length - 1];
            if (last && last.label === label) { last.count++; }
            else { segs.push({ label, count: 1, transit }); }
          });
          return (
            <div className="flex items-center gap-0.5 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
              {segs.map((seg, i) => (
                <div key={i} className="flex items-center gap-0.5 shrink-0">
                  <div className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${seg.transit ? 'bg-amber-400/40' : 'bg-white/20'}`}>
                    {seg.label} {seg.count > 1 && <span className="opacity-70">×{seg.count}</span>}
                  </div>
                  {i < segs.length - 1 && <span className="text-white/30 text-[8px]">›</span>}
                </div>
              ))}
            </div>
          );
        })()}
        {/* Quick stats */}
        {(() => {
          const pricedDays = generatedItinerary.filter(d => d.estimatedCostUSD > 0);
          if (pricedDays.length === 0) return null;
          const mostExpensive = pricedDays.reduce((a, b) => a.estimatedCostUSD > b.estimatedCostUSD ? a : b);
          const cheapest = pricedDays.reduce((a, b) => a.estimatedCostUSD < b.estimatedCostUSD ? a : b);
          const avgUSD = totalUSD / generatedItinerary.length;
          return (
            <div className="mt-2 pt-2 border-t border-white/20 grid grid-cols-3 gap-2 text-center text-[10px]">
              <div>
                <p className="opacity-60">Día + caro</p>
                <p className="font-semibold">Día {mostExpensive.day} · ${fmt(mostExpensive.estimatedCostUSD)}</p>
              </div>
              <div>
                <p className="opacity-60">Día + económico</p>
                <p className="font-semibold">Día {cheapest.day} · ${fmt(cheapest.estimatedCostUSD)}</p>
              </div>
              <div>
                <p className="opacity-60">Promedio/día</p>
                <p className="font-semibold">${fmt(avgUSD)} USD</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Day cards — Lista */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {generatedItinerary.length >= 10 && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const n = parseInt(jumpDay, 10);
                if (n >= 1 && n <= generatedItinerary.length) {
                  document.getElementById(`itin-day-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                setJumpDay('');
              }}
              className="flex items-center gap-2"
            >
              <input
                type="number"
                min={1}
                max={generatedItinerary.length}
                value={jumpDay}
                onChange={e => setJumpDay(e.target.value)}
                placeholder={`Ir al día (1-${generatedItinerary.length})`}
                className="flex-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <button type="submit" className="text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-700 rounded-lg px-2 py-1.5 hover:bg-brand-50 dark:hover:bg-brand-900/20">
                Ir →
              </button>
            </form>
          )}
          {generatedItinerary.map((day) => {
            const dayDate = getDayDate(day.day);
            const isNoteOpen = expandedNoteDay === day.day;
            const userNote = dayNotes[day.day] ?? '';
            return (
              <div
                key={day.day}
                id={`itin-day-${day.day}`}
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {day.isTransitDay
                              ? "Día de traslado"
                              : day.attractions.length > 0
                                ? day.attractions.map(a => a.name).join(' · ')
                                : "Día libre"}
                          </p>
                          {dayDate && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium shrink-0">
                              {fmtDate(dayDate)}
                            </span>
                          )}
                        </div>
                        {/* Per-attraction detail rows */}
                        {!day.isTransitDay && day.attractions.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            {day.attractions.map(attr => {
                              const attrRate = getRate(currencyRates as Record<string, number>, selectedDestination.currencyCode);
                              const attrUSD = attrRate > 0 ? Math.round(attr.costPerCouplePerDay / attrRate) : 0;
                              const attrNoteKey = `day${day.day}-${attr.id}`;
                              const isAttrNoteOpen = expandedAttrNote === attrNoteKey;
                              const attrNote = attractionNotes[attrNoteKey] ?? '';
                              return (
                                <div key={attr.id} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 overflow-hidden">
                                  {attr.imageUrl && (
                                    <img
                                      src={attr.imageUrl}
                                      alt={attr.name}
                                      className="w-full h-24 object-cover"
                                      loading="lazy"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  )}
                                  <div className="px-2.5 py-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{attr.name}</p>
                                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{attr.region}{attr.rating ? ` · ${'★'.repeat(Math.round(attr.rating))}` : ''}</p>
                                      {attrNote && !isAttrNoteOpen && (
                                        <p className="text-[10px] text-brand-500 dark:text-brand-400 italic truncate">&ldquo;{attrNote}&rdquo;</p>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                                      <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">${attrUSD} USD</p>
                                      <a
                                        href={`https://maps.google.com/?q=${attr.coordinates.lat},${attr.coordinates.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] text-blue-400 hover:text-blue-500"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        🗺
                                      </a>
                                      <button
                                        onClick={() => setExpandedAttrNote(isAttrNoteOpen ? null : attrNoteKey)}
                                        className="text-[9px] text-gray-300 dark:text-gray-600 hover:text-brand-500"
                                      >
                                        {isAttrNoteOpen ? '▲' : '✏️'}
                                      </button>
                                    </div>
                                  </div>
                                  {isAttrNoteOpen && (
                                    <textarea
                                      rows={2}
                                      value={attrNote}
                                      onChange={e => setAttractionNote(attrNoteKey, e.target.value)}
                                      placeholder="Nota para esta atracción..."
                                      className="mt-1.5 w-full text-[10px] rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-brand-400"
                                    />
                                  )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
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
        <div className="space-y-3">
          {!startDate && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
              Selecciona fecha de inicio para ver las fechas reales en el calendario
            </p>
          )}
          {(() => {
            // Group days by calendar month when startDate is known
            if (!startDate) {
              // Fallback: simple flat grid (no dates)
              return (
                <div className="grid grid-cols-7 gap-0.5">
                  {['L','M','X','J','V','S','D'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">{d}</div>
                  ))}
                  {Array.from({ length: calendarOffset }).map((_, i) => <div key={`p${i}`} />)}
                  {generatedItinerary.map(day => (
                    <button
                      key={day.day}
                      onClick={() => {
                        setViewMode('list');
                        setTimeout(() => document.getElementById(`itin-day-${day.day}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                      }}
                      className={`rounded-lg p-1 min-h-[48px] flex flex-col items-center border w-full hover:ring-1 hover:ring-brand-400 transition-all ${day.isTransitDay ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                    >
                      <span className={`text-xs font-bold ${day.isTransitDay ? 'text-amber-600 dark:text-amber-400' : 'text-brand-600'}`}>{day.day}</span>
                      <span className="text-[9px] text-gray-600 dark:text-gray-400 text-center leading-tight mt-0.5 line-clamp-2">{day.isTransitDay ? '✈️' : (day.attractions[0]?.name.split(' ')[0] ?? '—')}</span>
                    </button>
                  ))}
                </div>
              );
            }

            // Group by year-month
            const groups: { key: string; month: number; year: number; days: typeof generatedItinerary }[] = [];
            generatedItinerary.forEach(day => {
              const d = getDayDate(day.day)!;
              const key = `${d.getFullYear()}-${d.getMonth()}`;
              let g = groups.find(g => g.key === key);
              if (!g) { g = { key, month: d.getMonth(), year: d.getFullYear(), days: [] }; groups.push(g); }
              g.days.push(day);
            });

            const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

            return groups.map(group => {
              const firstDate = getDayDate(group.days[0].day)!;
              const offset = (firstDate.getDay() + 6) % 7;
              return (
                <div key={group.key} className="space-y-1">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300 text-center bg-gray-50 dark:bg-gray-800 rounded-lg py-1">
                    {monthNames[group.month]} {group.year}
                  </p>
                  <div className="grid grid-cols-7 gap-0.5">
                    {['L','M','X','J','V','S','D'].map(d => (
                      <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-0.5">{d}</div>
                    ))}
                    {Array.from({ length: offset }).map((_, i) => <div key={`p${i}`} />)}
                    {group.days.map(day => {
                      const dayDate = getDayDate(day.day)!;
                      return (
                        <button
                          key={day.day}
                          onClick={() => {
                            setViewMode('list');
                            setTimeout(() => document.getElementById(`itin-day-${day.day}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                          }}
                          className={`rounded-lg p-1 min-h-[52px] flex flex-col items-center border w-full hover:ring-1 hover:ring-brand-400 transition-all ${day.isTransitDay ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                        >
                          <span className={`text-xs font-bold ${day.isTransitDay ? 'text-amber-600 dark:text-amber-400' : 'text-brand-600'}`}>{day.day}</span>
                          <span className="text-[8px] text-gray-400 dark:text-gray-500 leading-tight">{dayDate.getDate()}</span>
                          <span className="text-[9px] text-gray-600 dark:text-gray-400 text-center leading-tight mt-0.5 line-clamp-2">{day.isTransitDay ? '✈️' : (day.attractions[0]?.name.split(' ')[0] ?? '—')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
