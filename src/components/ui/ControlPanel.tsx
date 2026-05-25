"use client";

import React from "react";
import { useTravelStore } from "@/store/useTravelStore";
import DestinationSelector from "./DestinationSelector";
import AttractionList from "./AttractionList";
import ItineraryForm from "./ItineraryForm";
import ItineraryView from "./ItineraryView";
import CostSummary from "./CostSummary";
import DestinationInfo from "./DestinationInfo";
import PackingList from "./PackingList";
import { destinations } from "@/data/destinations";
import { getRate } from "@/utils/rates";
import { PRE_TRIP_ITEMS } from "@/data/preTripData";

function getSeasonBadge(dest: typeof destinations[0], month: number) {
  if (!dest.goodMonths || dest.goodMonths.length === 12) return { icon: '✅', color: 'text-green-600 dark:text-green-400' };
  if (dest.avoidMonths?.includes(month)) return { icon: '⚠️', color: 'text-red-500 dark:text-red-400' };
  if (dest.goodMonths.includes(month)) return { icon: '✅', color: 'text-green-600 dark:text-green-400' };
  return { icon: '⚡', color: 'text-amber-600 dark:text-amber-400' };
}

const REGIONS: Record<string, string> = {
  japan: 'Asia', bali: 'Asia', singapore: 'Asia', thailand: 'Asia', vietnam: 'Asia', philippines: 'Asia', maldives: 'Asia',
  greece: 'Europa', italy: 'Europa', france: 'Europa', croatia: 'Europa', portugal: 'Europa',
  morocco: 'África',
  mexico: 'América',
};

const BUDGET_TIERS = [
  { label: '< $7K', max: 7000, min: 0 },
  { label: '$7–12K', max: 12000, min: 7000 },
  { label: '> $12K', max: Infinity, min: 12000 },
];

function WelcomeScreen() {
  const { setSelectedDestination, currencyRates, tripDate, tripDays } = useTravelStore();
  const [regionFilter, setRegionFilter] = React.useState<string | null>(null);
  const [budgetTier, setBudgetTier] = React.useState<number | null>(null);
  const [sortByPrice, setSortByPrice] = React.useState(false);
  const checkMonth = tripDate
    ? new Date(tripDate + 'T12:00:00').getMonth() + 1
    : new Date().getMonth() + 1;

  const idealDests = destinations.filter(d =>
    d.goodMonths?.includes(checkMonth) && !d.avoidMonths?.includes(checkMonth)
  );

  const getTripTotal = (dest: typeof destinations[0]) => {
    const rate = getRate(currencyRates as Record<string, number>, dest.currencyCode);
    const dailyUSD = (dest.dailyBaseAccommodationCost + dest.dailyBaseFoodCost) / rate;
    return Math.round(dailyUSD * tripDays + (dest.estimatedFlightFromChileUSD ?? 3500));
  };

  let filtered = regionFilter
    ? destinations.filter(d => REGIONS[d.id] === regionFilter)
    : destinations;

  if (budgetTier !== null) {
    const tier = BUDGET_TIERS[budgetTier];
    filtered = filtered.filter(d => { const t = getTripTotal(d); return t >= tier.min && t < tier.max; });
  }

  if (sortByPrice) {
    filtered = [...filtered].sort((a, b) => getTripTotal(a) - getTripTotal(b));
  }

  const regionOptions = [...new Set(destinations.map(d => REGIONS[d.id]).filter(Boolean))];

  return (
    <div className="space-y-3">
      <div className="text-center py-2">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">¿A dónde quieres ir?</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Selecciona un destino para empezar</p>
      </div>

      {/* Best for this month */}
      {idealDests.length > 0 && (
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
          <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
            ✅ Ideal para este mes
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {idealDests.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDestination(d)}
                className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 rounded-full px-2 py-0.5 hover:bg-green-200 dark:hover:bg-green-800/60 transition-colors"
              >
                {d.flag} {d.country}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Region + budget filters + sort */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setRegionFilter(null)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!regionFilter ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Todos</button>
          {regionOptions.map(r => (
            <button key={r} onClick={() => setRegionFilter(r === regionFilter ? null : r)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${regionFilter === r ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{r}</button>
          ))}
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Presup:</span>
          {BUDGET_TIERS.map((tier, i) => (
            <button key={i} onClick={() => setBudgetTier(budgetTier === i ? null : i)} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${budgetTier === i ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{tier.label}</button>
          ))}
          <button onClick={() => setSortByPrice(v => !v)} className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${sortByPrice ? 'bg-amber-400 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>$ ↑</button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-6 text-center text-gray-400 dark:text-gray-500">
          <p className="text-2xl mb-1">🔍</p>
          <p className="text-xs">Sin destinos en ese rango · <button className="text-brand-500 hover:underline" onClick={() => { setRegionFilter(null); setBudgetTier(null); }}>Limpiar filtros</button></p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((dest) => {
          const rate = getRate(currencyRates as Record<string, number>, dest.currencyCode);
          const dailyUSD = Math.round((dest.dailyBaseAccommodationCost + dest.dailyBaseFoodCost) / rate);
          const tripTotalUSD = getTripTotal(dest);
          const totalK = tripTotalUSD >= 1000 ? `$${(tripTotalUSD / 1000).toFixed(1)}K` : `$${tripTotalUSD}`;
          const budgetColor = tripTotalUSD < 7000 ? 'text-green-400' : tripTotalUSD < 12000 ? 'text-amber-300' : 'text-red-300';
          const season = getSeasonBadge(dest, checkMonth);
          const coverImg = dest.attractions[0]?.imageUrl;
          return (
            <button
              key={dest.id}
              onClick={() => setSelectedDestination(dest)}
              className="relative overflow-hidden rounded-xl border-2 border-transparent hover:border-brand-400 transition-all text-center h-28 group"
              style={coverImg ? { backgroundImage: `url(${coverImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              {!coverImg && <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600" />}
              <div className="absolute inset-0 bg-black/55 group-hover:bg-black/40 transition-colors" />
              <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 h-full px-1">
                <span className="text-lg">{dest.flag}</span>
                <span className="text-[11px] font-bold text-white leading-tight drop-shadow text-center">{dest.country}</span>
                <span className={`text-[10px] font-semibold ${budgetColor}`}>{totalK} total</span>
                <span className="text-[9px] text-white/60">~${dailyUSD}/día {season.icon}</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">💡 Total estimado {tripDays}d · vuelo + aloj. + comida · 2 pax</p>
    </div>
  );
}

const tabs = [
  { key: "attractions" as const, label: "Atractivos", icon: "📍" },
  { key: "itinerary" as const, label: "Itinerario", icon: "📅" },
  { key: "costs" as const, label: "Costos", icon: "💰" },
  { key: "packing" as const, label: "Maleta", icon: "🎒" },
];

const stepperSteps = [
  { label: 'Destino', icon: '🌏' },
  { label: 'Atracciones', icon: '📍' },
  { label: 'Itinerario', icon: '📅' },
];

export default function ControlPanel() {
  const { activeTab, setActiveTab, selectedDestination, darkMode, toggleDarkMode, tripDate, setTripDate, activePins, generatedItinerary, itineraryOutdated, resetTrip, preTripChecked } = useTravelStore();

  const currentStep = !selectedDestination ? 0 : activePins.length === 0 ? 1 : generatedItinerary.length === 0 ? 2 : 3;
  const preTripTotal = PRE_TRIP_ITEMS.length;
  const preTripDone = Object.values(preTripChecked ?? {}).filter(Boolean).length;
  const preTripPending = preTripTotal - preTripDone;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header — gradient banner with logo/title only */}
      <div className="bg-gradient-to-r from-brand-600 to-purple-700 px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 text-2xl">
            👨‍🦲👩‍🦱
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Luna de Miel Planner
            </h1>
            <p className="text-xs text-white/70">
              {selectedDestination
                ? `${selectedDestination.flag ?? ''} ${selectedDestination.country} · ${activePins.length > 0 ? `${activePins.length} atractivo${activePins.length > 1 ? 's' : ''}` : 'sin atracciones'}`
                : 'Planificador interactivo de viajes'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {selectedDestination && (
              <button
                onClick={resetTrip}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-colors text-xs"
                title="Nueva planificación"
              >
                🔄
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Modo oscuro"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* Destination selector — white background so the select renders correctly */}
      <div className="px-4 pt-3 pb-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <DestinationSelector />
        {/* Trip date & countdown */}
        {selectedDestination && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="date"
              value={tripDate ?? ''}
              onChange={e => setTripDate(e.target.value || null)}
              className="flex-1 text-xs rounded-lg border border-gray-200 px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              min={new Date().toISOString().split('T')[0]}
            />
            {tripDate && (() => {
              const days = Math.ceil((new Date(tripDate).getTime() - Date.now()) / 86400000);
              return days > 0 ? (
                <span className="text-xs font-bold text-brand-600 whitespace-nowrap">✈ {days}d</span>
              ) : (
                <span className="text-xs font-bold text-green-600 whitespace-nowrap">¡Hoy!</span>
              );
            })()}
          </div>
        )}
        {/* Progress stepper */}
        {selectedDestination && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {stepperSteps.map((s, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1 ${i < currentStep ? 'text-brand-600' : i === currentStep ? 'text-gray-700 font-semibold' : 'text-gray-300 dark:text-gray-600'}`}>
                  <span>{i < currentStep ? '✅' : s.icon}</span>
                  <span>{s.label}</span>
                </div>
                {i < stepperSteps.length - 1 && <span className="text-gray-200 dark:text-gray-700 mx-0.5">→</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Itinerary form — integrated below header without extra card border */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ItineraryForm />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${
              activeTab === tab.key
                ? "border-b-2 border-brand-500 text-brand-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
            {tab.key === "itinerary" && itineraryOutdated && (
              <span className="absolute top-1.5 right-1 w-2 h-2 rounded-full bg-amber-400" />
            )}
            {tab.key === "packing" && preTripPending > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold">
                {preTripPending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {activeTab === "attractions" && (
          selectedDestination ? (
            <div className="space-y-4">
              <DestinationInfo />
              <AttractionList />
            </div>
          ) : (
            <WelcomeScreen />
          )
        )}
        {activeTab === "itinerary" && <ItineraryView />}
        {activeTab === "costs" && <CostSummary />}
        {activeTab === "packing" && <PackingList />}
      </div>
    </div>
  );
}
