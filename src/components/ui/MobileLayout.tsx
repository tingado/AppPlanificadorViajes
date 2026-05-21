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
import { destinations } from "@/data/destinations";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

function WelcomeScreen() {
  const { setSelectedDestination } = useTravelStore();
  return (
    <div className="space-y-3">
      <div className="text-center pt-2 pb-1">
        <p className="text-sm font-semibold text-gray-700">¿A dónde quieres ir?</p>
        <p className="text-xs text-gray-400 mt-0.5">Toca un destino para comenzar</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {destinations.map(dest => (
          <button
            key={dest.id}
            onClick={() => setSelectedDestination(dest)}
            className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 hover:border-brand-300 hover:bg-brand-50 active:scale-95 transition-all text-center"
          >
            <span className="text-2xl">{dest.flag}</span>
            <span className="text-xs font-semibold text-gray-800 leading-tight">{dest.country}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const tabs = [
  { key: "attractions" as const, label: "Atractivos", icon: "📍" },
  { key: "itinerary" as const, label: "Itinerario", icon: "📅" },
  { key: "costs" as const, label: "Costos", icon: "💰" },
];

export default function MobileLayout() {
  const { activeTab, setActiveTab, activePins, selectedDestination } = useTravelStore();
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
        {/* Handle — draggable */}
        <div
          className="flex justify-center pt-2 pb-1 flex-shrink-0 cursor-row-resize touch-none"
          onTouchStart={onDragStart}
          onMouseDown={onDragStart}
        >
          <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Destination + Days — always visible, no scroll */}
        <div className="px-3 pb-2 flex-shrink-0 space-y-2 border-b border-gray-100 dark:border-gray-700">
          <DestinationSelector />
          {selectedDestination && <ItineraryForm compact />}
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
        </div>
      </div>
    </div>
  );
}
