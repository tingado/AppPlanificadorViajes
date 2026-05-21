import { LatLng, Attraction, RouteInfo } from "@/types";

export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);
  const h =
    sin1 * sin1 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sin2 * sin2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Average travel speed (km/h) — mix of ground and short-haul transit
const AVG_SPEED_KMH = 60;

export function estimateTravelHours(distanceKm: number): number {
  return distanceKm / AVG_SPEED_KMH;
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function optimizeRouteOrder(pins: Attraction[]): Attraction[] {
  if (pins.length <= 2) return pins;

  const remaining = [...pins.slice(1)]; // Keep first pin as start
  const result = [pins[0]];

  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((pin, i) => {
      const d = haversineDistanceKm(last.coordinates, pin.coordinates);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    });

    result.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }

  return result;
}

export function buildRouteInfo(attractions: Attraction[]): RouteInfo {
  if (attractions.length < 2) {
    return { totalDistanceKm: 0, totalTimeHours: 0, segments: [] };
  }

  const segments = [];
  let totalDistanceKm = 0;
  let totalTimeHours = 0;

  for (let i = 0; i < attractions.length - 1; i++) {
    const from = attractions[i];
    const to = attractions[i + 1];
    const distanceKm = haversineDistanceKm(from.coordinates, to.coordinates);
    const timeHours = estimateTravelHours(distanceKm);
    totalDistanceKm += distanceKm;
    totalTimeHours += timeHours;
    segments.push({
      from: from.name,
      to: to.name,
      distanceKm: Math.round(distanceKm),
      timeHours,
    });
  }

  return {
    totalDistanceKm: Math.round(totalDistanceKm),
    totalTimeHours,
    segments,
  };
}
