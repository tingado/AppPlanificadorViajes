"use client";

import { useTravelStore } from "@/store/useTravelStore";

export default function ItineraryForm() {
  const {
    tripDays,
    setTripDays,
    activePins,
    selectedDestination,
    generateItineraryAction,
    generatedItinerary,
    setActiveTab,
  } = useTravelStore();

  const canGenerate = selectedDestination && activePins.length > 0;

  function handleGenerate() {
    generateItineraryAction();
    setActiveTab("itinerary");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Días de viaje
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={2}
            max={21}
            value={tripDays}
            onChange={(e) => setTripDays(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
          <span className="w-12 text-center rounded-lg border border-gray-200 py-1 text-sm font-bold text-brand-600">
            {tripDays}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Arrastra para ajustar (2–21 días)</p>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">Resumen del plan</p>
        <ul className="space-y-0.5 text-xs text-gray-500">
          <li>
            Destino:{" "}
            <span className="text-gray-700 font-medium">
              {selectedDestination?.country ?? "Sin seleccionar"}
            </span>
          </li>
          <li>
            Atractivos seleccionados:{" "}
            <span className="text-gray-700 font-medium">{activePins.length} / 3</span>
          </li>
          <li>
            Duración:{" "}
            <span className="text-gray-700 font-medium">{tripDays} días</span>
          </li>
          <li>
            Viajeros: <span className="text-gray-700 font-medium">2 personas (pareja)</span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        {generatedItinerary.length > 0 ? "Regenerar itinerario" : "Generar itinerario"}
      </button>

      {!canGenerate && (
        <p className="text-center text-xs text-gray-400">
          Selecciona un destino y al menos un atractivo para continuar
        </p>
      )}
    </div>
  );
}
