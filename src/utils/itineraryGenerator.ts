import { Attraction, Destination, ItineraryDay, CurrencyRates } from "@/types";
import { haversineDistanceKm, estimateTravelHours } from "./geo";

const TRANSIT_DAY_THRESHOLD_HOURS = 5;

function sortByProximity(attractions: Attraction[]): Attraction[] {
  if (attractions.length <= 1) return attractions;
  const result: Attraction[] = [attractions[0]];
  const remaining = attractions.slice(1);

  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let closestIdx = 0;
    let closestDist = Infinity;
    remaining.forEach((a, i) => {
      const d = haversineDistanceKm(last.coordinates, a.coordinates);
      if (d < closestDist) { closestDist = d; closestIdx = i; }
    });
    result.push(remaining.splice(closestIdx, 1)[0]);
  }
  return result;
}

function convertCost(
  localAmount: number,
  currencyCode: string,
  rates: CurrencyRates
): { usd: number; clp: number } {
  let usdAmount: number;
  const rateKey = `USD_TO_${currencyCode}`;
  const rate = rates[rateKey] || 1;
  usdAmount = rate > 0 ? localAmount / rate : 0;
  return {
    usd: usdAmount,
    clp: usdAmount * rates.USD_TO_CLP,
  };
}

export function generateItinerary(
  destination: Destination,
  selectedAttractions: Attraction[],
  tripDays: number,
  rates: CurrencyRates
): ItineraryDay[] {
  const sorted = sortByProximity(selectedAttractions);
  const days: ItineraryDay[] = [];
  let dayIndex = 1;

  for (let i = 0; i < sorted.length && dayIndex <= tripDays; i++) {
    const attraction = sorted[i];

    if (i > 0) {
      const prev = sorted[i - 1];
      const distKm = haversineDistanceKm(prev.coordinates, attraction.coordinates);
      const travelHours = estimateTravelHours(distKm);

      if (travelHours > TRANSIT_DAY_THRESHOLD_HOURS && dayIndex <= tripDays) {
        const transitCostLocal =
          destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
        const converted = convertCost(transitCostLocal, destination.currencyCode, rates);

        // Estimar costo de vuelo según duración del traslado
        let flightCostUSD: number;
        if (travelHours > 4) {
          flightCostUSD = 150 * 2; // vuelo largo: $150 USD/persona × 2
        } else if (travelHours >= 2) {
          flightCostUSD = 80 * 2;  // vuelo corto: $80 USD/persona × 2
        } else {
          flightCostUSD = 0;       // traslado terrestre
        }

        days.push({
          day: dayIndex++,
          isTransitDay: true,
          attractions: [],
          travelTimeHours: travelHours,
          flightCostUSD,
          estimatedCostLocal: transitCostLocal,
          estimatedCostUSD: converted.usd + flightCostUSD,
          estimatedCostCLP: converted.clp + flightCostUSD * rates.USD_TO_CLP,
          notes: `Día de traslado de ${prev.name} a ${attraction.name} (~${Math.round(travelHours)} h)`,
        });
      }
    }

    if (dayIndex <= tripDays) {
      const baseDaily =
        destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
      const totalLocal = attraction.costPerCouplePerDay + baseDaily;
      const converted = convertCost(totalLocal, destination.currencyCode, rates);
      days.push({
        day: dayIndex++,
        isTransitDay: false,
        attractions: [attraction],
        estimatedCostLocal: totalLocal,
        estimatedCostUSD: converted.usd,
        estimatedCostCLP: converted.clp,
      });
    }
  }

  // Fill remaining days with the last attraction if any are left
  if (sorted.length > 0) {
    const lastAttraction = sorted[sorted.length - 1];
    while (dayIndex <= tripDays) {
      const baseDaily =
        destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
      const totalLocal = lastAttraction.costPerCouplePerDay + baseDaily;
      const converted = convertCost(totalLocal, destination.currencyCode, rates);
      days.push({
        day: dayIndex++,
        isTransitDay: false,
        attractions: [lastAttraction],
        estimatedCostLocal: totalLocal,
        estimatedCostUSD: converted.usd,
        estimatedCostCLP: converted.clp,
        notes: "Día libre en el mismo destino",
      });
    }
  }

  return days;
}

export function computeTotals(
  days: ItineraryDay[]
): { totalLocal: number; totalUSD: number; totalCLP: number } {
  return days.reduce(
    (acc, d) => ({
      totalLocal: acc.totalLocal + d.estimatedCostLocal,
      totalUSD: acc.totalUSD + d.estimatedCostUSD,
      totalCLP: acc.totalCLP + d.estimatedCostCLP,
    }),
    { totalLocal: 0, totalUSD: 0, totalCLP: 0 }
  );
}
