"use client";

import { useTravelStore } from "@/store/useTravelStore";
import { formatDuration } from "@/utils/geo";
import ExportButton from "@/components/ui/ExportButton";

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export default function ItineraryView() {
  const {
    generatedItinerary,
    selectedDestination,
    currencyRates,
    itineraryOutdated,
    generateItineraryAction,
    setActiveTab,
  } = useTravelStore();

  if (!selectedDestination || generatedItinerary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
        <span className="text-4xl mb-3">📅</span>
        <p className="text-sm">
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

  return (
    <div className="space-y-3">
      {/* Outdated banner */}
      {itineraryOutdated && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-amber-700 font-medium">
            ⚠️ Cambios detectados — el itinerario puede estar desactualizado
          </p>
          <button
            onClick={generateItineraryAction}
            className="text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg px-2 py-1 hover:bg-amber-100 shrink-0"
          >
            Regenerar
          </button>
        </div>
      )}

      {/* Export button */}
      <div className="flex justify-end">
        <ExportButton />
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

      {/* Day cards */}
      <div className="space-y-2">
        {generatedItinerary.map((day) => (
          <div
            key={day.day}
            className={`rounded-xl border p-3 ${
              day.isTransitDay
                ? "border-amber-200 bg-amber-50"
                : "border-gray-200 bg-white"
            }`}
          >
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
                  <p className="text-sm font-semibold text-gray-800">
                    {day.isTransitDay
                      ? "Día de traslado"
                      : day.attractions[0]?.name ?? "Día libre"}
                  </p>
                  {day.travelTimeHours && (
                    <p className="text-xs text-amber-600">
                      ✈ {formatDuration(day.travelTimeHours)} de viaje
                    </p>
                  )}
                  {day.isTransitDay && day.flightCostUSD != null && day.flightCostUSD > 0 && (
                    <p className="text-xs text-blue-600 mt-0.5">
                      ✈ Vuelo estimado: ${fmt(day.flightCostUSD)} USD
                    </p>
                  )}
                  {day.notes && (
                    <p className="text-xs text-gray-400 mt-0.5">{day.notes}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-gray-700">
                  {fmt(day.estimatedCostUSD * currencyRates.USD_TO_CLP)} CLP
                </p>
                <p className="text-xs text-gray-400">${fmt(day.estimatedCostUSD)} USD</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
