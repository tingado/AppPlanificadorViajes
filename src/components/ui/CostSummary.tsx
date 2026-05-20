"use client";

import { useTravelStore } from "@/store/useTravelStore";
import { computeTotals } from "@/utils/itineraryGenerator";

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export default function CostSummary() {
  const {
    generatedItinerary,
    selectedDestination,
    currencyRates,
    setCurrencyRates,
  } = useTravelStore();

  if (!selectedDestination || generatedItinerary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
        <span className="text-4xl mb-3">💰</span>
        <p className="text-sm">Genera un itinerario para ver el desglose de costos</p>
      </div>
    );
  }

  const totals = computeTotals(generatedItinerary);
  const code = selectedDestination.currencyCode;
  const rateKey = `USD_TO_${code}`;
  const localRate = currencyRates[rateKey] ?? 1;

  return (
    <div className="space-y-4">
      {/* Main cost card */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Resumen financiero — 2 viajeros
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { label: "Peso Chileno", code: "CLP", value: fmt(totals.totalCLP), flag: "🇨🇱" },
            { label: "Dólar Americano", code: "USD", value: `$${fmt(totals.totalUSD)}`, flag: "🇺🇸" },
            { label: selectedDestination.currency, code, value: fmt(totals.totalLocal), flag: selectedDestination.flag ?? "🌍" },
          ].map((row) => (
            <div key={row.code} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span>{row.flag}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{row.label}</p>
                  <p className="text-xs text-gray-400">{row.code}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {row.value} <span className="text-xs font-normal text-gray-400">{row.code}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exchange rate editor */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Tasas de cambio (ajustables)
        </p>
        {[
          { label: "1 USD → CLP", key: "USD_TO_CLP", value: currencyRates.USD_TO_CLP },
          { label: `1 USD → ${code}`, key: rateKey, value: localRate },
        ].map((rate) => (
          <div key={rate.key} className="flex items-center justify-between gap-3">
            <label className="text-xs text-gray-600 shrink-0">{rate.label}</label>
            <input
              type="number"
              value={rate.value}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0) setCurrencyRates({ [rate.key]: val });
              }}
              className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        ))}
        <p className="text-xs text-gray-400">
          Modifica las tasas para recalcular con valores actualizados
        </p>
      </div>

      {/* Per-day average */}
      <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
        <p className="text-xs text-brand-700 font-medium">
          Promedio diario por pareja:{" "}
          <strong>
            {fmt(totals.totalCLP / generatedItinerary.length)} CLP
          </strong>{" "}
          · <strong>${fmt(totals.totalUSD / generatedItinerary.length)} USD</strong>
        </p>
      </div>
    </div>
  );
}
