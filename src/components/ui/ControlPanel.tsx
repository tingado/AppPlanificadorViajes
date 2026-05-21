"use client";

import { useTravelStore } from "@/store/useTravelStore";
import DestinationSelector from "./DestinationSelector";
import AttractionList from "./AttractionList";
import ItineraryForm from "./ItineraryForm";
import ItineraryView from "./ItineraryView";
import CostSummary from "./CostSummary";
import DestinationInfo from "./DestinationInfo";

const tabs = [
  { key: "attractions" as const, label: "Atractivos", icon: "📍" },
  { key: "itinerary" as const, label: "Itinerario", icon: "📅" },
  { key: "costs" as const, label: "Costos", icon: "💰" },
];

export default function ControlPanel() {
  const { activeTab, setActiveTab } = useTravelStore();

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
            <p className="text-xs text-white/70">Planificador interactivo de viajes</p>
          </div>
        </div>
      </div>

      {/* Destination selector — white background so the select renders correctly */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-200">
        <DestinationSelector />
      </div>

      {/* Itinerary form — integrated below header without extra card border */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <ItineraryForm />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-brand-500 text-brand-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {activeTab === "attractions" && (
          <div className="space-y-4">
            <DestinationInfo />
            <AttractionList />
          </div>
        )}
        {activeTab === "itinerary" && <ItineraryView />}
        {activeTab === "costs" && <CostSummary />}
      </div>
    </div>
  );
}
