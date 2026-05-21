"use client";

import { useEffect, useRef, useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { formatDuration } from "@/utils/geo";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const softMarkersRef = useRef<import("leaflet").CircleMarker[]>([]);
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
      softMarkersRef.current.forEach((m) => m.remove());
      softMarkersRef.current = [];

      // Remove route
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      // Show all destination attractions as soft circle markers (not pinned)
      if (selectedDestination) {
        const pinnedIds = new Set(activePins.map(p => p.id));
        selectedDestination.attractions.forEach((attr) => {
          if (pinnedIds.has(attr.id)) return;
          const circle = L.circleMarker([attr.coordinates.lat, attr.coordinates.lng], {
            radius: 6,
            fillColor: "#9ca3af",
            color: "#fff",
            weight: 1.5,
            opacity: 0.8,
            fillOpacity: 0.5,
          })
            .bindTooltip(attr.name, { direction: 'top', offset: [0, -6] })
            .addTo(map);
          softMarkersRef.current.push(circle);
        });
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

        const starsHtml = pin.rating
          ? `<p style="font-size:11px;color:#f59e0b;margin:0 0 2px">${'★'.repeat(Math.round(pin.rating))}</p>`
          : '';
        const imageHtml = pin.imageUrl
          ? `<img src="${pin.imageUrl}" alt="${pin.name}" style="width:100%;height:96px;object-fit:cover;border-radius:6px;margin-bottom:6px;display:block" onerror="this.style.display='none'" />`
          : '';

        const marker = L.marker([pin.coordinates.lat, pin.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="width:200px;font-family:sans-serif;text-align:center">
              ${imageHtml}
              <p style="font-weight:700;font-size:13px;color:#111827;margin:0 0 2px">${pin.name}</p>
              ${starsHtml}
              <p style="font-size:11px;color:#6b7280;margin:0">~$${pin.costPerCouplePerDay}/día pareja</p>
            </div>`,
            { maxWidth: 200 }
          );

        // Distance tooltip to next pin when route is active
        if (showRoute && routeInfo && idx < activePins.length - 1) {
          const segment = routeInfo.segments[idx];
          if (segment) {
            marker.bindTooltip(
              `${segment.distanceKm.toFixed(0)} km · ${segment.timeHours.toFixed(1)}h`,
              { permanent: true, direction: 'top', offset: [0, -36], className: 'route-distance-tooltip' }
            ).openTooltip();
          }
        }

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
          dashArray: "8 4",
          opacity: 0.7,
        }).addTo(map);
      }
    };
    mapInit();
  }, [activePins, showRoute, routeInfo, mapReady, selectedDestination]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating route info panel — bottom-left */}
      {showRoute && routeInfo && (
        <div className="absolute bottom-6 left-2 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-2 text-xs max-w-[160px]">
          <p className="font-semibold text-gray-800 mb-1">🗺 Ruta total</p>
          <p className="text-gray-600">{routeInfo.totalDistanceKm.toFixed(0)} km</p>
          <p className="text-gray-600">{formatDuration(routeInfo.totalTimeHours)} aprox.</p>
          {routeInfo.segments.map((seg, i) => (
            <p key={i} className="text-gray-400 mt-0.5 truncate">
              {seg.from.split(' ')[0]} → {seg.to.split(' ')[0]}: {seg.distanceKm.toFixed(0)}km
            </p>
          ))}
        </div>
      )}

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
