"use client";

import { useState, useEffect } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { Attraction } from "@/types";
import AttractionModal from "./AttractionModal";

function formatLocalCost(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AttractionList() {
  const {
    selectedDestination,
    activePins,
    toggleAttraction,
    pinLimitReached,
    attractionNotes,
    setAttractionNote,
    optimizeRoute,
  } = useTravelStore();

  const regions = selectedDestination
    ? [...new Set(selectedDestination.attractions.map((a) => a.region))]
    : [];
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  useEffect(() => {
    setActiveRegion(null);
    setSearch("");
  }, [selectedDestination?.id]);

  const filtered = selectedDestination
    ? selectedDestination.attractions.filter((a) => {
        const matchRegion = !activeRegion || a.region === activeRegion;
        const matchSearch =
          !search ||
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase());
        return matchRegion && matchSearch;
      })
    : [];

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
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar atracción..."
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>
      {regions.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveRegion(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeRegion === null
                ? "bg-brand-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
      {activePins.length >= 3 && (
        <button
          onClick={optimizeRoute}
          className="w-full text-xs font-semibold text-brand-600 border border-brand-300 rounded-lg py-2 hover:bg-brand-50"
        >
          ✨ Optimizar orden de visita
        </button>
      )}
      {filtered.map((attraction: Attraction) => {
        const isActive = activePins.some((p) => p.id === attraction.id);
        return (
          <div
            key={attraction.id}
            className={`w-full rounded-xl border p-3 transition-all duration-200 ${
              isActive
                ? "border-brand-400 bg-brand-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50/30"
            }`}
          >
            <button
              onClick={() => toggleAttraction(attraction)}
              aria-label={isActive ? "Desactivar " + attraction.name : "Activar " + attraction.name}
              className="w-full text-left min-h-[44px]"
            >
              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isActive ? "✓" : "○"}
                </div>
                {attraction.imageUrl && (
                  <img
                    src={attraction.imageUrl}
                    alt={attraction.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-100 cursor-pointer"
                    loading="lazy"
                    onClick={(e) => { e.stopPropagation(); setSelectedAttraction(attraction); }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="text-sm font-semibold text-gray-800 cursor-pointer hover:text-brand-600"
                      onClick={(e) => { e.stopPropagation(); setSelectedAttraction(attraction); }}
                    >{attraction.name}</p>
                    <span className="inline-block rounded-full bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 font-medium">
                      {attraction.region}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                    {attraction.description}
                  </p>
                  <p className="text-xs text-brand-600 font-semibold mt-0.5">
                    ~${attraction.costPerCouplePerDay} USD/día · 2 personas
                  </p>
                </div>
              </div>
            </button>
            {isActive && (
              <textarea
                value={attractionNotes[attraction.id] ?? ""}
                onChange={(e) => setAttractionNote(attraction.id, e.target.value)}
                placeholder="Agregar nota…"
                rows={2}
                className="mt-2 w-full text-xs rounded-lg border border-gray-200 p-2 resize-none focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            )}
          </div>
        );
      })}
      {selectedAttraction && (
        <AttractionModal
          attraction={selectedAttraction}
          onClose={() => setSelectedAttraction(null)}
        />
      )}
    </div>
  );
}
