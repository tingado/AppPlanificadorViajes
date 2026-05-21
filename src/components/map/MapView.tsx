"use client";

import { useEffect, useRef, useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { formatDuration } from "@/utils/geo";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const polylineRef = useRef<import("leaflet").Polyline | null>(null);

  const {
    selectedDestination,
    activePins,
    showRoute,
    routeInfo,
    calculateRoute,
    clearRoute,
  } = useTravelStore();

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (leafletMapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;

      map.whenReady(() => {
        setMapReady(true);
      });
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Fly to destination
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !selectedDestination) return;
    const map = leafletMapRef.current;
    const { lat, lng } = selectedDestination.centerCoordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.invalidateSize();
    try {
      map.flyTo([lat, lng], selectedDestination.zoom, { duration: 1.5 });
    } catch {
      try { map.setView([lat, lng], selectedDestination.zoom); } catch { /* ignore */ }
    }
  }, [selectedDestination, mapReady]);

  // Manage markers
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;
    const mapInit = async () => {
      const L = (await import("leaflet")).default;
      const map = leafletMapRef.current!;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Remove route
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      if (activePins.length === 0) return;

      const colors = ["#c026d3", "#7c3aed", "#0891b2"];

      activePins.forEach((pin, idx) => {
        const color = colors[idx] ?? "#6b7280";
        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              background:${color};
              width:32px;height:32px;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              display:flex;align-items:center;justify-content:center;
            ">
              <span style="transform:rotate(45deg);color:white;font-weight:bold;font-size:12px;">${idx + 1}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([pin.coordinates.lat, pin.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:180px;font-family:sans-serif">
              <img src="${pin.imageUrl ?? ''}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px" onerror="this.style.display='none'" />
              <p style="font-weight:700;font-size:14px;margin:0 0 4px">${pin.name}</p>
              <p style="font-size:11px;color:#6b7280;margin:0 0 6px">${pin.region}</p>
              <p style="font-size:12px;color:#111;margin:0 0 6px">${pin.description}</p>
              <p style="font-size:11px;font-weight:600;color:#c026d3;margin:0">~$${pin.costPerCouplePerDay} USD/día · 2 personas</p>
            </div>`,
            { maxWidth: 220 }
          );

        markersRef.current.push(marker);
      });

      // Fit bounds to all pins
      if (activePins.length > 1) {
        const bounds = L.latLngBounds(
          activePins.map((p) => [p.coordinates.lat, p.coordinates.lng])
        );
        map.fitBounds(bounds, { padding: [60, 60] });
      }

      // Draw polyline if route is shown
      if (showRoute && activePins.length >= 2) {
        const latlngs = activePins.map((p) => [p.coordinates.lat, p.coordinates.lng] as [number, number]);
        polylineRef.current = L.polyline(latlngs, {
          color: "#c026d3",
          weight: 3,
          dashArray: "8 6",
          opacity: 0.8,
        }).addTo(map);
      }
    };
    mapInit();
  }, [activePins, showRoute, mapReady]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Route overlay */}
      {activePins.length >= 2 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
          {!showRoute ? (
            <button
              onClick={calculateRoute}
              className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-brand-600 transition"
            >
              🗺 Calcular ruta
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg border border-brand-200">
              {routeInfo && (
                <span className="text-xs font-medium text-gray-700">
                  📍 {routeInfo.totalDistanceKm} km ·{" "}
                  {formatDuration(routeInfo.totalTimeHours)} estimado
                </span>
              )}
              <button
                onClick={clearRoute}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
