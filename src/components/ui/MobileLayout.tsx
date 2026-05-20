"use client";

import dynamic from "next/dynamic";
import { useTravelStore } from "@/store/useTravelStore";
import ControlPanel from "./ControlPanel";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function MobileLayout() {
  const { mobilePanel, setMobilePanel } = useTravelStore();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map layer — always rendered underneath */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ${
          mobilePanel === "map" ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <MapView />
      </div>

      {/* Toggle pill */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1100] flex rounded-full bg-white shadow-md border border-gray-200 overflow-hidden">
        {(["map", "controls"] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setMobilePanel(panel)}
            className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
              mobilePanel === panel
                ? "bg-brand-500 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {panel === "map" ? "🗺 Mapa" : "⚙ Controles"}
          </button>
        ))}
      </div>

      {/* Bottom sliding panel */}
      <div
        className={`absolute inset-x-0 bottom-0 top-12 z-[1050] bg-gray-50 overflow-y-auto transition-transform duration-300 shadow-2xl rounded-t-2xl ${
          mobilePanel === "controls" ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <ControlPanel />
      </div>
    </div>
  );
}
