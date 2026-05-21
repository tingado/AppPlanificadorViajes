"use client";

import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { destinations } from "@/data/destinations";

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export default function CostSummary() {
  const {
    generatedItinerary,
    selectedDestination,
    currencyRates,
    setCurrencyRates,
    tripDays,
    budgetOverrides,
    setBudgetOverride,
    budgetGoalUSD,
    setBudgetGoalUSD,
  } = useTravelStore();

  if (!selectedDestination || generatedItinerary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500">
        <span className="text-4xl mb-3">💰</span>
        <p className="text-sm dark:text-gray-400">Genera un itinerario para ver el desglose de costos</p>
      </div>
    );
  }

  const code = selectedDestination.currencyCode;
  const rateKey = `USD_TO_${code}`;
  const localRate = currencyRates[rateKey] ?? 1;

  const intlFlightUSD = budgetOverrides.internationalFlightUSD ?? 3500;
  const visaFeeUSD = (selectedDestination.visaFeePerPersonUSD ?? 0) * 2; // 2 travelers

  // ── Totals ────────────────────────────────────────────────────────────────
  const destinationUSD = generatedItinerary.reduce((s, d) => s + d.estimatedCostUSD, 0);
  const totalUSD = destinationUSD + intlFlightUSD + visaFeeUSD;
  const totalCLP = totalUSD * currencyRates.USD_TO_CLP;
  const totalLocal = totalUSD * localRate;
  const numDays = generatedItinerary.length || tripDays;

  // ── Category breakdown ────────────────────────────────────────────────────
  // Flights: international + in-destination transit flights
  const transitFlightUSD = generatedItinerary.reduce(
    (s, d) => s + (d.flightCostUSD ?? 0),
    0
  );
  const totalFlightUSD = intlFlightUSD + transitFlightUSD;

  // Accommodation & food: use budget overrides if set, otherwise fall back to
  // destination base costs. Values are in local currency per day.
  const baseAccommodation = budgetOverrides.accommodationPerNight ?? selectedDestination.dailyBaseAccommodationCost;
  const baseFood = budgetOverrides.foodPerDay ?? selectedDestination.dailyBaseFoodCost;

  const totalAccomUSD =
    localRate > 0 ? (baseAccommodation * numDays) / localRate : 0;
  const totalFoodUSD =
    localRate > 0 ? (baseFood * numDays) / localRate : 0;

  // Activities: whatever remains after subtracting flights, accommodation, food and visa
  const totalActivitiesUSD = Math.max(
    0,
    totalUSD - totalFlightUSD - totalAccomUSD - totalFoodUSD - visaFeeUSD
  );

  const categories = [
    { label: "✈ Vuelos", usd: totalFlightUSD },
    { label: "🏨 Alojamiento", usd: totalAccomUSD },
    { label: "🍜 Comida", usd: totalFoodUSD },
    { label: "🎯 Actividades", usd: totalActivitiesUSD },
    ...(visaFeeUSD > 0 ? [{ label: "🛂 Visa", usd: visaFeeUSD }] : []),
  ];

  const maxCategoryUSD = Math.max(...categories.map((c) => c.usd), 1);

  // ── Distribution bar-chart data ───────────────────────────────────────────
  const chartCategories = [
    { label: "🏨 Alojamiento", amount: totalAccomUSD, color: "bg-blue-400" },
    { label: "🍜 Comida", amount: totalFoodUSD, color: "bg-green-400" },
    { label: "🎭 Actividades", amount: totalActivitiesUSD, color: "bg-purple-400" },
    { label: "✈ Vuelos", amount: totalFlightUSD, color: "bg-amber-400" },
    ...(visaFeeUSD > 0 ? [{ label: "🛂 Visa", amount: visaFeeUSD, color: "bg-rose-400" }] : []),
  ];
  const grandTotal = chartCategories.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-4">
      {/* ── 1. Tarjeta principal con gradiente ─────────────────────────── */}
      <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-md">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">
          Total estimado · 2 viajeros
        </p>
        <p className="text-3xl font-bold tracking-tight">
          ${fmt(totalUSD)}{" "}
          <span className="text-lg font-normal opacity-80">USD</span>
        </p>
        <p className="text-xs opacity-75 mt-1">
          ~${fmt(totalUSD / numDays)} USD/día · ~${fmt(totalUSD / 2)} por persona
        </p>
        <div className="mt-3 flex gap-4 text-sm flex-wrap">
          <span className="opacity-90">🇨🇱 {fmt(totalCLP)} CLP</span>
          {code !== "CLP" && (
            <span className="opacity-90">
              {selectedDestination.flag ?? "🌍"} {fmt(totalLocal)} {code}
            </span>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-white/20 flex gap-3 text-xs opacity-80 flex-wrap">
          <span>🛫 Vuelo intl: ${fmt(intlFlightUSD)}</span>
          <span>🏖 Destino: ${fmt(destinationUSD)}</span>
          {visaFeeUSD > 0 && <span>🛂 Visa: ${fmt(visaFeeUSD)}</span>}
        </div>
      </div>

      {/* ── 1b. Meta de presupuesto ────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            🎯 Meta de presupuesto
          </label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 dark:text-gray-500">$</span>
            <input
              type="number"
              min={0}
              placeholder="ej: 8000"
              value={budgetGoalUSD ?? ''}
              onChange={e => setBudgetGoalUSD(e.target.value ? Number(e.target.value) : null)}
              className="w-24 text-sm text-right rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">USD</span>
          </div>
        </div>
        {budgetGoalUSD != null && budgetGoalUSD > 0 && (() => {
          const pct = Math.min((totalUSD / budgetGoalUSD) * 100, 100);
          const over = totalUSD > budgetGoalUSD;
          const near = !over && totalUSD > budgetGoalUSD * 0.9;
          const barColor = over ? 'bg-red-500' : near ? 'bg-amber-400' : 'bg-green-500';
          const textColor = over ? 'text-red-600 dark:text-red-400' : near ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400';
          const diff = Math.abs(totalUSD - budgetGoalUSD);
          return (
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              <p className={`text-xs font-semibold ${textColor}`}>
                {over
                  ? `⚠️ $${fmt(diff)} USD sobre el presupuesto`
                  : near
                    ? `⚡ $${fmt(diff)} USD disponibles (cerca del límite)`
                    : `✅ $${fmt(diff)} USD disponibles`}
                <span className="ml-1 text-gray-400 dark:text-gray-500 font-normal">
                  (${fmt(totalUSD)} / ${fmt(budgetGoalUSD)} USD)
                </span>
              </p>
            </div>
          );
        })()}
      </div>

      {/* ── 2. Breakdown por categoría ──────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Desglose por categoría
          </p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {categories.map((cat) => {
            const pct = totalUSD > 0 ? (cat.usd / totalUSD) * 100 : 0;
            const barWidth = totalUSD > 0 ? (cat.usd / maxCategoryUSD) * 100 : 0;
            return (
              <div key={cat.label} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {cat.label}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      ${fmt(cat.usd)}{" "}
                      <span className="text-xs font-normal text-gray-400 dark:text-gray-500">USD</span>
                    </span>
                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                      ({fmt(pct)}%)
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2b. Distribución del gasto (mini bar chart) ────────────────── */}
      {grandTotal > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Distribución del gasto
          </p>
          {chartCategories.filter((c) => c.amount > 0).map((cat) => (
            <div key={cat.label} className="space-y-0.5">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                <span>{cat.label}</span>
                <span className="font-medium">
                  ${fmt(cat.amount)}{" "}
                  <span className="text-gray-400 dark:text-gray-500">
                    ({Math.round((cat.amount / grandTotal) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                  style={{ width: `${(cat.amount / grandTotal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 3. Resumen financiero multi-moneda ─────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Resumen financiero — 2 viajeros
          </p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {[
            { label: "Peso Chileno", code: "CLP", value: fmt(totalCLP), flag: "🇨🇱" },
            { label: "Dólar Americano", code: "USD", value: `$${fmt(totalUSD)}`, flag: "🇺🇸" },
            { label: selectedDestination.currency, code, value: fmt(totalLocal), flag: selectedDestination.flag ?? "🌍" },
          ].map((row) => (
            <div key={row.code} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span>{row.flag}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{row.code}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {row.value}{" "}
                <span className="text-xs font-normal text-gray-400 dark:text-gray-500">{row.code}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Tasas de cambio editables ───────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Tasas de cambio (ajustables)
        </p>
        {[
          { label: "1 USD → CLP", key: "USD_TO_CLP", value: currencyRates.USD_TO_CLP },
          { label: `1 USD → ${code}`, key: rateKey, value: localRate },
        ].map((rate) => (
          <div key={rate.key} className="flex items-center justify-between gap-3">
            <label className="text-xs text-gray-600 dark:text-gray-300 shrink-0">{rate.label}</label>
            <input
              type="number"
              value={rate.value}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0) setCurrencyRates({ [rate.key]: val });
              }}
              className="w-28 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        ))}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Modifica las tasas para recalcular con valores actualizados
        </p>
      </div>

      {/* ── 5. Editor de presupuesto base ──────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">⚙️ Ajustar presupuesto</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-700 dark:text-gray-300">🛫 Vuelo Santiago → destino (ida+vuelta, 2 pax)</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">$</span>
              <input
                type="number"
                min={0}
                value={intlFlightUSD}
                onChange={e => setBudgetOverride('internationalFlightUSD', Number(e.target.value))}
                className="w-20 text-sm text-right rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">USD</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-700 dark:text-gray-300">🏨 Alojamiento/noche</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                value={baseAccommodation}
                onChange={e => setBudgetOverride('accommodationPerNight', Number(e.target.value))}
                className="w-24 text-sm text-right rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">{code}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-700 dark:text-gray-300">🍜 Comida/día</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                value={baseFood}
                onChange={e => setBudgetOverride('foodPerDay', Number(e.target.value))}
                className="w-24 text-sm text-right rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">{code}</span>
            </div>
          </div>
        </div>
        {(budgetOverrides.accommodationPerNight !== undefined || budgetOverrides.foodPerDay !== undefined || budgetOverrides.internationalFlightUSD !== undefined) && (
          <button
            onClick={() => {
              setBudgetOverride('accommodationPerNight', selectedDestination?.dailyBaseAccommodationCost ?? 0);
              setBudgetOverride('foodPerDay', selectedDestination?.dailyBaseFoodCost ?? 0);
              setBudgetOverride('internationalFlightUSD', 3500);
            }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500"
          >
            ↺ Restaurar valores por defecto
          </button>
        )}
      </div>

      <MultiDestEstimator primaryUSD={totalUSD} primaryCLP={totalCLP} />
    </div>
  );
}

function MultiDestEstimator({ primaryUSD, primaryCLP }: { primaryUSD: number; primaryCLP: number }) {
  const [segments, setSegments] = useState<{ destId: string; days: number }[]>([]);
  const { currencyRates } = useTravelStore();

  const addSegment = () => setSegments(s => [...s, { destId: destinations[0].id, days: 7 }]);
  const removeSegment = (i: number) => setSegments(s => s.filter((_, idx) => idx !== i));
  const updateSegment = (i: number, key: 'destId' | 'days', val: string | number) =>
    setSegments(s => s.map((seg, idx) => idx === i ? { ...seg, [key]: val } : seg));

  if (segments.length === 0) {
    return (
      <button
        onClick={addSegment}
        className="w-full text-xs text-brand-600 dark:text-brand-400 border border-dashed border-brand-300 dark:border-brand-700 rounded-xl py-2.5 hover:bg-brand-50 dark:hover:bg-brand-900/20"
      >
        + Agregar segundo destino al presupuesto
      </button>
    );
  }

  let combinedUSD = primaryUSD;
  const segDetails = segments.map(seg => {
    const dest = destinations.find(d => d.id === seg.destId);
    if (!dest) return { dest: null, estimatedUSD: 0, days: seg.days };
    const localRate = currencyRates[`USD_TO_${dest.currencyCode}`] ?? 1;
    const dailyLocal = dest.dailyBaseAccommodationCost + dest.dailyBaseFoodCost;
    const dailyUSD = localRate > 0 ? dailyLocal / localRate : 0;
    const estimatedUSD = dailyUSD * seg.days;
    combinedUSD += estimatedUSD;
    return { dest, estimatedUSD, days: seg.days };
  });
  const combinedCLP = combinedUSD * currencyRates.USD_TO_CLP;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">🌏 Viaje multi-destino</p>
        <button onClick={addSegment} className="text-xs text-brand-500 hover:underline">+ añadir</button>
      </div>
      {segDetails.map((seg, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <select
              value={segments[i].destId}
              onChange={e => updateSegment(i, 'destId', e.target.value)}
              className="flex-1 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 focus:outline-none"
            >
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.flag} {d.country}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={60}
              value={segments[i].days}
              onChange={e => updateSegment(i, 'days', Number(e.target.value))}
              className="w-14 text-xs text-right rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 focus:outline-none"
            />
            <span className="text-xs text-gray-400">días</span>
            <button onClick={() => removeSegment(i)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-sm">✕</button>
          </div>
          {seg.dest && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
              {seg.dest.flag} Est. ~${fmt(seg.estimatedUSD)} USD ({seg.days} días base, sin actividades)
            </p>
          )}
        </div>
      ))}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">Total combinado (2 personas)</p>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
          ${fmt(combinedUSD)} <span className="text-xs font-normal text-gray-400">USD</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{fmt(combinedCLP)} CLP</p>
      </div>
    </div>
  );
}
