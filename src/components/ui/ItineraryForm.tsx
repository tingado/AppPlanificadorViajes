"use client";

import { useTravelStore } from "@/store/useTravelStore";

const presets = [7, 10, 14, 21, 25];

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Math.round(n));
}

interface ItineraryFormProps {
  compact?: boolean;
}

export default function ItineraryForm({ compact }: ItineraryFormProps) {
  const {
    tripDays,
    setTripDays,
    activePins,
    selectedDestination,
    generateItineraryAction,
    generatedItinerary,
    setActiveTab,
    currencyRates,
    budgetOverrides,
  } = useTravelStore();

  const canGenerate = selectedDestination && activePins.length > 0;

  // Quick estimate: base accommodation+food + avg attraction cost spread across days
  const quickEstimateUSD = (() => {
    if (!selectedDestination) return null;
    const localRate = (currencyRates as Record<string, number>)[`USD_TO_${selectedDestination.currencyCode}`] ?? 1;
    const baseNight = budgetOverrides.accommodationPerNight ?? selectedDestination.dailyBaseAccommodationCost;
    const baseFood = budgetOverrides.foodPerDay ?? selectedDestination.dailyBaseFoodCost;
    const basePerDayUSD = localRate > 0 ? (baseNight + baseFood) / localRate : 0;
    const activityTotalUSD = activePins.reduce((s, pin) => s + (localRate > 0 ? pin.costPerCouplePerDay / localRate : 0), 0);
    const intlFlight = budgetOverrides.internationalFlightUSD ?? selectedDestination.estimatedFlightFromChileUSD ?? 3500;
    return basePerDayUSD * tripDays + activityTotalUSD + intlFlight;
  })();

  function handleGenerate() {
    generateItineraryAction();
    setActiveTab("itinerary");
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Días:</span>
        {presets.map((d) => (
          <button
            key={d}
            onClick={() => setTripDays(d)}
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              tripDays === d ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            {d}d
          </button>
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({tripDays}d)</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          Días de viaje
        </label>

        {/* Preset chips */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {presets.map((d) => (
            <button
              key={d}
              onClick={() => setTripDays(d)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                tripDays === d
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>

        {/* Continuous slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>1 día</span>
            <span className="font-semibold text-brand-600">{tripDays} días</span>
            <span>30 días</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={tripDays}
            onChange={(e) => setTripDays(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Resumen del plan</p>
        <ul className="space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
          <li>
            Destino:{" "}
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {selectedDestination?.country ?? "Sin seleccionar"}
            </span>
          </li>
          <li>
            Atractivos seleccionados:{" "}
            <span className="text-gray-700 dark:text-gray-200 font-medium">{activePins.length} / 10</span>
          </li>
          <li>
            Duración:{" "}
            <span className="text-gray-700 dark:text-gray-200 font-medium">{tripDays} días</span>
          </li>
          <li>
            Viajeros: <span className="text-gray-700 dark:text-gray-200 font-medium">2 personas (pareja)</span>
          </li>
          {quickEstimateUSD != null && (
            <li className="pt-1 border-t border-gray-200 dark:border-gray-700 mt-1">
              Costo estimado:{" "}
              <span className="text-brand-600 dark:text-brand-400 font-semibold">
                ~${fmt(quickEstimateUSD)} USD
              </span>
              <span className="text-gray-400 dark:text-gray-500 ml-1">
                · {fmt(quickEstimateUSD * currencyRates.USD_TO_CLP)} CLP
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Generate button */}
      <div>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
            canGenerate
              ? "bg-brand-500 hover:bg-brand-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          {canGenerate
            ? generatedItinerary.length > 0
              ? "Regenerar itinerario ✨"
              : "Generar itinerario ✨"
            : generatedItinerary.length > 0
            ? "Regenerar itinerario"
            : "Generar itinerario"}
        </button>

        {/* Pin counter hint */}
        {activePins.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
            Selecciona al menos una atracción para generar
          </p>
        )}

        {/* Active pin chips */}
        {activePins.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activePins.map((pin, i) => (
              <span
                key={pin.id}
                className="inline-flex items-center gap-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2 py-0.5 text-xs font-medium"
              >
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {pin.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
