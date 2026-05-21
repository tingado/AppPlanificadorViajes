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

function WelcomeScreen() {
  const { setSelectedDestination } = useTravelStore();
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">¿A dónde quieres ir?</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Selecciona un destino para empezar</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {destinations.map((dest) => (
          <button
            key={dest.id}
            onClick={() => setSelectedDestination(dest)}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <span className="text-3xl">{dest.flag}</span>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">{dest.country}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">{dest.currencyCode}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{dest.attractions.length} atracciones</span>
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
  { key: "packing" as const, label: "Maleta", icon: "🎒" },
];

const stepperSteps = [
  { label: 'Destino', icon: '🌏' },
  { label: 'Atracciones', icon: '📍' },
  { label: 'Itinerario', icon: '📅' },
];

export default function ControlPanel() {
  const { activeTab, setActiveTab, selectedDestination, darkMode, toggleDarkMode, tripDate, setTripDate, activePins, generatedItinerary } = useTravelStore();

  const currentStep = !selectedDestination ? 0 : activePins.length === 0 ? 1 : generatedItinerary.length === 0 ? 2 : 3;

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
          <button
            onClick={toggleDarkMode}
            className="ml-auto p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            title="Modo oscuro"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
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
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-brand-500 text-brand-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
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
