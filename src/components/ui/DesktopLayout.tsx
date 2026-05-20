"use client";

import dynamic from "next/dynamic";
import ControlPanel from "./ControlPanel";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function DesktopLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left control panel — fixed 50% */}
      <div className="w-1/2 h-full overflow-y-auto border-r border-gray-200 bg-gray-50">
        <ControlPanel />
      </div>

      {/* Right map panel — fixed 50% */}
      <div className="w-1/2 h-full relative">
        <MapView />
      </div>
    </div>
  );
}
