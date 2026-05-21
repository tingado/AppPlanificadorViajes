"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useCallback, useEffect } from "react";
import ControlPanel from "./ControlPanel";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function DesktopLayout() {
  const [panelWidth, setPanelWidth] = useState(400);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(400);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    const newWidth = Math.max(320, Math.min(600, startWidth.current + delta));
    setPanelWidth(newWidth);
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left control panel — resizable */}
      <div
        className="h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0"
        style={{ width: panelWidth }}
      >
        <ControlPanel />
      </div>

      {/* Resize handle */}
      <div
        className="w-1.5 h-full flex-shrink-0 cursor-col-resize hover:bg-brand-400/40 transition-colors group relative"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-y-0 left-0 right-0 group-hover:bg-brand-400/30" />
      </div>

      {/* Right map panel — fills remaining space */}
      <div className="flex-1 h-full relative overflow-hidden">
        <MapView />
      </div>
    </div>
  );
}
