"use client";

import dynamic from "next/dynamic";
import ControlPanel from "./ControlPanel";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function DesktopLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left control panel — fixed width between 380-420px */}
      <div className="min-w-[380px] max-w-[420px] w-[400px] h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <ControlPanel />
      </div>

      {/* Right map panel — fills remaining space */}
      <div className="flex-1 h-full relative">
        <MapView />
      </div>
    </div>
  );
}
