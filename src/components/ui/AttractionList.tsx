"use client";

import { useState, useEffect } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { Attraction } from "@/types";

function formatLocalCost(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AttractionList() {
  const { selectedDestination, activePins, toggleAttraction, pinLimitReached } =
    useTravelStore();

  const regions = selectedDestination
    ? [...new Set(selectedDestination.attractions.map((a) => a.region))]
    : [];
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  useEffect(() => {
    setActiveRegion(null);
  }, [selectedDestination?.id]);

  const filtered = activeRegion
    ? selectedDestination!.attractions.filter((a) => a.region === activeRegion)
    : selectedDestination?.attractions ?? [];

  if (!selectedDestination) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
        <span className="text-5xl mb-3">🌏</span>
        <p className="text-sm font-medium text-gray-500">Elige un destino para explorar</p>
        <p className="text-xs mt-1">Japón, Bali, Singapur, Tailandia, Vietnam o Filipinas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pinLimitReached && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          Límite de 3 pines alcanzado. Se reemplazó el atractivo más antiguo.
        </div>
      )}
      <p className="text-xs text-gray-500 mb-2">
        Selecciona hasta <strong>3 atractivos</strong> para visualizarlos en el mapa
      </p>
      {regions.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveRegion(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeRegion === null
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r === activeRegion ? null : r)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeRegion === r
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
      {filtered.map((attraction: Attraction) => {
        const isActive = activePins.some((p) => p.id === attraction.id);
        const pinIndex = activePins.findIndex((p) => p.id === attraction.id);
        return (
          <button
            key={attraction.id}
            onClick={() => toggleAttraction(attraction)}
            className={`w-full text-left rounded-xl border p-3 min-h-[44px] transition-all duration-200 ${
              isActive
                ? "border-brand-400 bg-brand-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50/30"
            }`}
          >
            <div className="flex items-start gap-2">
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isActive ? pinIndex + 1 : "○"}
              </div>
              {attraction.imageUrl && (
                <img
                  src={attraction.imageUrl}
                  alt={attraction.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">{attraction.name}</p>
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                  {attraction.description}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {attraction.region}
                  </span>
                  <span className="text-xs text-brand-600 font-medium">
                    {formatLocalCost(
                      attraction.costPerCouplePerDay,
                      selectedDestination.currencyCode
                    )}
                    /día por pareja
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
