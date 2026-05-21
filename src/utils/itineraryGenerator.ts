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

/**
 * Builds the sequence of scheduled (attraction + optional transit) days and
 * returns both the array of ItineraryDay items and the count of days consumed.
 */
function buildAttractionDays(
  destination: Destination,
  sorted: Attraction[],
  tripDays: number,
  rates: CurrencyRates
): { days: ItineraryDay[]; daysUsed: number } {
  const days: ItineraryDay[] = [];
  let dayIndex = 1;

  for (let i = 0; i < sorted.length && dayIndex <= tripDays; i++) {
    const attraction = sorted[i];

    // ── Transit day between clusters ──────────────────────────────────────
    if (i > 0) {
      const prev = sorted[i - 1];
      const distKm = haversineDistanceKm(prev.coordinates, attraction.coordinates);
      const travelHours = estimateTravelHours(distKm);

      if (travelHours > TRANSIT_DAY_THRESHOLD_HOURS && dayIndex <= tripDays) {
        const transitCostLocal =
          destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
        const converted = convertCost(transitCostLocal, destination.currencyCode, rates);

        let flightCostUSD: number;
        if (travelHours > 4) {
          flightCostUSD = 150 * 2;
        } else if (travelHours >= 2) {
          flightCostUSD = 80 * 2;
        } else {
          flightCostUSD = 0;
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

    // ── Activity day for this attraction ──────────────────────────────────
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

  return { days, daysUsed: dayIndex - 1 };
}

export function generateItinerary(
  destination: Destination,
  selectedAttractions: Attraction[],
  tripDays: number,
  rates: CurrencyRates
): ItineraryDay[] {
  const sorted = sortByProximity(selectedAttractions);

  // Build the core attraction+transit days first
  const { days, daysUsed } = buildAttractionDays(destination, sorted, tripDays, rates);

  const remaining = tripDays - daysUsed;

  if (remaining <= 0 || sorted.length === 0) {
    return days;
  }

  // ── Distribute remaining days as free exploration days ──────────────────
  // When there are many spare days relative to pins, spread free days evenly
  // between attractions so the itinerary doesn't feel front-loaded.
  const numAttractions = sorted.length;

  // How many free days to insert *between* each pair of scheduled days,
  // and how many to append at the end.
  // Strategy: insert ~floor(remaining / (numAttractions + 1)) days as gaps,
  // then place any leftover at the end.
  const gapSlots = numAttractions + 1; // before first, between, after last
  const freeDaysPerSlot = Math.floor(remaining / gapSlots);
  const extraAtEnd = remaining - freeDaysPerSlot * gapSlots;

  // We need to rebuild day numbers after inserting gaps.
  // Easier: collect scheduled days (already built), then interleave free days.

  // Identify the scheduled day indices that are NOT transit days —
  // we insert free days after each activity cluster.
  const withFree: ItineraryDay[] = [];
  let newDayNumber = 1;

  // Free days before first attraction
  for (let f = 0; f < freeDaysPerSlot; f++) {
    const baseDaily =
      destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
    const converted = convertCost(baseDaily, destination.currencyCode, rates);
    withFree.push({
      day: newDayNumber++,
      isTransitDay: false,
      attractions: [],
      estimatedCostLocal: baseDaily,
      estimatedCostUSD: converted.usd,
      estimatedCostCLP: converted.clp,
      notes: "Día libre para explorar",
    });
  }

  // Walk through the already-built days and insert free days after each activity day
  for (let i = 0; i < days.length; i++) {
    const scheduledDay = { ...days[i], day: newDayNumber++ };
    withFree.push(scheduledDay);

    // After each non-transit day (except the last scheduled day), insert free days
    if (!scheduledDay.isTransitDay && i < days.length - 1) {
      for (let f = 0; f < freeDaysPerSlot; f++) {
        const baseDaily =
          destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
        const converted = convertCost(baseDaily, destination.currencyCode, rates);
        withFree.push({
          day: newDayNumber++,
          isTransitDay: false,
          attractions: [],
          estimatedCostLocal: baseDaily,
          estimatedCostUSD: converted.usd,
          estimatedCostCLP: converted.clp,
          notes: "Día libre para explorar",
        });
      }
    }
  }

  // Append remaining free days at the end (last attraction's region)
  const totalFreeAtEnd = freeDaysPerSlot + extraAtEnd;
  const lastAttraction = sorted[sorted.length - 1];
  for (let f = 0; f < totalFreeAtEnd; f++) {
    const baseDaily =
      destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
    const totalLocal = lastAttraction.costPerCouplePerDay + baseDaily;
    const converted = convertCost(totalLocal, destination.currencyCode, rates);
    withFree.push({
      day: newDayNumber++,
      isTransitDay: false,
      attractions: [lastAttraction],
      estimatedCostLocal: totalLocal,
      estimatedCostUSD: converted.usd,
      estimatedCostCLP: converted.clp,
      notes: "Día libre para explorar",
    });
  }

  return withFree;
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
