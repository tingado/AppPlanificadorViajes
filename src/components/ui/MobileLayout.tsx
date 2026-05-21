"use client";
import dynamic from "next/dynamic";
import { useRef, useState, useCallback, useEffect } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import DestinationSelector from "./DestinationSelector";
import AttractionList from "./AttractionList";
import ItineraryForm from "./ItineraryForm";
import ItineraryView from "./ItineraryView";
import CostSummary from "./CostSummary";
import DestinationInfo from "./DestinationInfo";
import PackingList from "./PackingList";
import { destinations } from "@/data/destinations";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

function getSeasonBadge(dest: typeof destinations[0], month: number) {
  if (!dest.goodMonths || dest.goodMonths.length === 12) return { icon: '✅', color: 'text-green-600 dark:text-green-400' };
  if (dest.avoidMonths?.includes(month)) return { icon: '⚠️', color: 'text-red-500 dark:text-red-400' };
  if (dest.goodMonths.includes(month)) return { icon: '✅', color: 'text-green-600 dark:text-green-400' };
  return { icon: '⚡', color: 'text-amber-600 dark:text-amber-400' };
}

const REGIONS_MOBILE: Record<string, string> = {
  japan: 'Asia', bali: 'Asia', singapore: 'Asia', thailand: 'Asia', vietnam: 'Asia', philippines: 'Asia', maldives: 'Asia',
  greece: 'Europa', italy: 'Europa',
  morocco: 'África',
};

function WelcomeScreen() {
  const { setSelectedDestination, setActiveTab, currencyRates, tripDate } = useTravelStore();
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const checkMonth = tripDate
    ? new Date(tripDate + 'T12:00:00').getMonth() + 1
    : new Date().getMonth() + 1;

  const idealDests = destinations.filter(d =>
    d.goodMonths?.includes(checkMonth) && !d.avoidMonths?.includes(checkMonth)
  );
  const filtered = regionFilter ? destinations.filter(d => REGIONS_MOBILE[d.id] === regionFilter) : destinations;
  const regionOptions = [...new Set(destinations.map(d => REGIONS_MOBILE[d.id]).filter(Boolean))];

  return (
    <div className="space-y-3">
      <div className="text-center pt-2 pb-1">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">¿A dónde quieres ir?</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Toca un destino para comenzar</p>
      </div>

      {idealDests.length > 0 && (
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
          <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">✅ Ideal para este mes</p>
          <div className="flex gap-1.5 flex-wrap">
            {idealDests.map(d => (
              <button key={d.id} onClick={() => { setSelectedDestination(d); setActiveTab("attractions"); }}
                className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 rounded-full px-2 py-0.5 hover:bg-green-200 transition-colors">
                {d.flag} {d.country}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        <button onClick={() => setRegionFilter(null)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!regionFilter ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Todos</button>
        {regionOptions.map(r => (
          <button key={r} onClick={() => setRegionFilter(r === regionFilter ? null : r)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${regionFilter === r ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{r}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filtered.map(dest => {
          const rate = (currencyRates as Record<string, number>)[`USD_TO_${dest.currencyCode}`] ?? 1;
          const dailyUSD = Math.round((dest.dailyBaseAccommodationCost + dest.dailyBaseFoodCost) / rate);
          const budgetColor = dailyUSD < 200 ? 'text-green-400' : dailyUSD < 400 ? 'text-amber-300' : 'text-red-300';
          const season = getSeasonBadge(dest, checkMonth);
          const coverImg = dest.attractions[0]?.imageUrl;
          return (
            <button
              key={dest.id}
              onClick={() => { setSelectedDestination(dest); setActiveTab("attractions"); }}
              className="relative overflow-hidden rounded-xl border-2 border-transparent active:scale-95 transition-all text-center h-28"
              style={coverImg ? { backgroundImage: `url(${coverImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              {!coverImg && <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600" />}
              <div className="absolute inset-0 bg-black/55 active:bg-black/40 transition-colors" />
              <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 h-full px-1">
                <span className="text-xl">{dest.flag}</span>
                <span className="text-[11px] font-bold text-white leading-tight drop-shadow text-center">{dest.country}</span>
                <span className={`text-[10px] font-semibold ${budgetColor}`}>~${dailyUSD}/día</span>
                <span className="text-[9px] text-white/80">{season.icon}</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">💡 Alojamiento + comida base · 2 personas</p>
    </div>
  );
}

const tabs = [
  { key: "attractions" as const, label: "Atractivos", icon: "📍" },
  { key: "itinerary" as const, label: "Itinerario", icon: "📅" },
  { key: "costs" as const, label: "Costos", icon: "💰" },
  { key: "packing" as const, label: "Maleta", icon: "🧳" },
];

const stepperSteps = [
  { label: 'Destino', icon: '🌏' },
  { label: 'Atracciones', icon: '📍' },
  { label: 'Itinerario', icon: '📅' },
];

export default function MobileLayout() {
  const { activeTab, setActiveTab, activePins, selectedDestination, generatedItinerary, itineraryOutdated, darkMode, toggleDarkMode, tripDate, setTripDate, resetTrip } = useTravelStore();
  const pinCount = activePins.length;

  // Mejora 1: scroll al inicio al cambiar de tab
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setTimeout(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Mejora 3: drag handle para ajustar altura del mapa
  const [mapHeight, setMapHeight] = useState(38); // vh
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(38);

  const onDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    dragStartHeight.current = mapHeight;
  }, [mapHeight]);

  const onDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (dragStartY.current === null) return;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    const delta = clientY - dragStartY.current;
    const newHeight = Math.max(20, Math.min(70, dragStartHeight.current + (delta / window.innerHeight) * 100));
    setMapHeight(newHeight);
  }, []);

  const onDragEnd = useCallback(() => {
    dragStartY.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    return () => {
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
    };
  }, [onDragMove, onDragEnd]);

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900" style={{ height: '100dvh' }}>
      {/* Map — altura dinámica via drag */}
      <div className="flex-shrink-0" style={{ height: `${mapHeight}vh` }}>
        <MapView />
      </div>

      {/* Bottom panel — rest of screen */}
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg overflow-hidden min-h-0">
        {/* Handle row — drag handle + app name + dark mode toggle */}
        <div
          className="flex items-center px-4 pt-2 pb-1 flex-shrink-0 touch-none"
          onTouchStart={onDragStart}
          onMouseDown={onDragStart}
        >
          <div className="flex-1 flex justify-center cursor-row-resize">
            <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="ml-auto flex items-center gap-1">
            {selectedDestination && (
              <button
                onClick={(e) => { e.stopPropagation(); resetTrip(); }}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm px-1"
                title="Nueva planificación"
              >
                🔄
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); toggleDarkMode(); }}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-base px-1"
              title="Modo oscuro"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Destination + Days — always visible, no scroll */}
        <div className="px-3 pb-2 flex-shrink-0 space-y-2 border-b border-gray-100 dark:border-gray-700">
          <DestinationSelector />
          {selectedDestination && <ItineraryForm compact />}
          {selectedDestination && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={tripDate ?? ''}
                onChange={e => setTripDate(e.target.value || null)}
                className="flex-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-400"
                min={new Date().toISOString().split('T')[0]}
              />
              {tripDate && (() => {
                const days = Math.ceil((new Date(tripDate).getTime() - Date.now()) / 86400000);
                return days > 0
                  ? <span className="text-xs font-bold text-brand-600 whitespace-nowrap">✈ {days}d</span>
                  : <span className="text-xs font-bold text-green-600 whitespace-nowrap">¡Hoy!</span>;
              })()}
            </div>
          )}
          {/* Progress stepper */}
          {selectedDestination && (() => {
            const step = activePins.length === 0 ? 1 : generatedItinerary.length === 0 ? 2 : 3;
            return (
              <div className="flex items-center gap-1 text-[10px]">
                {stepperSteps.map((s, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    <span className={i < step ? 'text-brand-600' : i === step ? 'text-gray-600 dark:text-gray-300 font-semibold' : 'text-gray-300 dark:text-gray-600'}>
                      {i < step ? '✅' : s.icon} {s.label}
                    </span>
                    {i < stepperSteps.length - 1 && <span className="text-gray-200 dark:text-gray-700 mx-0.5">→</span>}
                  </span>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 py-2 text-xs font-semibold transition-colors relative ${
                activeTab === tab.key
                  ? "border-b-2 border-brand-500 text-brand-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {tab.icon} {tab.label}
              {tab.key === "attractions" && pinCount > 0 && (
                <span className="absolute top-1 right-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                  {pinCount}
                </span>
              )}
              {tab.key === "itinerary" && itineraryOutdated && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable tab content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0 p-3">
          {activeTab === "attractions" && (
            selectedDestination ? (
              <div className="space-y-2">
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
    </div>
  );
}
