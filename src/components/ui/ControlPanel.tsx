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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💑</span>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Luna de Miel Planner
            </h1>
            <p className="text-xs text-gray-400">Planificador interactivo de viajes</p>
          </div>
        </div>
        <DestinationSelector />

        {/* Planner tab (always visible) */}
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <ItineraryForm />
        </div>
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
      <div className="flex-1 overflow-y-auto p-4">
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
