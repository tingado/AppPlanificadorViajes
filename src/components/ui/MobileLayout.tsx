"use client";
import dynamic from "next/dynamic";
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

  return (
    <div className="flex flex-col h-dvh bg-gray-100">
      {/* Map — top 60% */}
      <div className="flex-shrink-0 w-full" style={{ height: "58vh" }}>
        <MapView />
      </div>

      {/* Bottom panel — bottom 40% */}
      <div className="flex flex-col flex-1 bg-white rounded-t-2xl shadow-lg overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Mini header */}
        <div className="flex items-center gap-2 px-4 pb-2">
          <span className="text-lg">👨‍🦲👩‍🦱</span>
          <span className="text-sm font-bold text-gray-900">Luna de Miel Planner</span>
        </div>

        {/* Destination selector */}
        <div className="px-4 pb-2">
          <DestinationSelector />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-semibold transition-colors relative ${
                activeTab === tab.key
                  ? "border-b-2 border-brand-500 text-brand-600"
                  : "text-gray-500"
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

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === "attractions" && (
            selectedDestination ? (
              <div className="space-y-3">
                <ItineraryForm />
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
