import { Attraction, Destination, ItineraryDay, CurrencyRates } from "@/types";
import { haversineDistanceKm, estimateTravelHours } from "./geo";
import { defaultCurrencyRates } from "@/data/destinations";

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
  const rate = rates[rateKey] || (defaultCurrencyRates as Record<string, number>)[rateKey] || 1;
  usdAmount = rate > 0 ? localAmount / rate : 0;
  return {
    usd: usdAmount,
    clp: usdAmount * rates.USD_TO_CLP,
  };
}

let freeDayCounter = 0;

/** Build a single free-exploration day (no attractions). */
function makeFreDay(
  dayNumber: number,
  destination: Destination,
  rates: CurrencyRates
): ItineraryDay {
  const baseDaily =
    destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
  const converted = convertCost(baseDaily, destination.currencyCode, rates);
  const hints = destination.freeDayHints;
  const note = hints && hints.length > 0
    ? hints[freeDayCounter++ % hints.length]
    : "Día libre para explorar a tu ritmo";
  return {
    day: dayNumber,
    isTransitDay: false,
    attractions: [],
    estimatedCostLocal: baseDaily,
    estimatedCostUSD: converted.usd,
    estimatedCostCLP: converted.clp,
    notes: note,
  };
}

/**
 * Group sorted attractions into clusters of at most `clusterSize`.
 * Attractions within the same cluster are visited on the same day block.
 */
function clusterAttractions(
  sorted: Attraction[],
  clusterSize: number
): Attraction[][] {
  const clusters: Attraction[][] = [];
  for (let i = 0; i < sorted.length; i += clusterSize) {
    clusters.push(sorted.slice(i, i + clusterSize));
  }
  return clusters;
}

/**
 * Builds the core sequence: transit day (when needed) + one activity day per
 * cluster. Each cluster's activity day includes 2-3 attractions grouped together.
 * Returns the list of days and how many days were consumed.
 */
function buildClusteredDays(
  destination: Destination,
  clusters: Attraction[][],
  tripDays: number,
  rates: CurrencyRates
): { days: ItineraryDay[]; daysUsed: number } {
  const days: ItineraryDay[] = [];
  let dayIndex = 1;

  for (let ci = 0; ci < clusters.length && dayIndex <= tripDays; ci++) {
    const cluster = clusters[ci];
    const firstInCluster = cluster[0];

    // ── Transit day between clusters ──────────────────────────────────────
    if (ci > 0) {
      const prevCluster = clusters[ci - 1];
      const prevLast = prevCluster[prevCluster.length - 1];
      const distKm = haversineDistanceKm(prevLast.coordinates, firstInCluster.coordinates);
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

        const fromName = prevLast.name;
        const toName = firstInCluster.name;

        days.push({
          day: dayIndex++,
          isTransitDay: true,
          attractions: [],
          travelTimeHours: travelHours,
          flightCostUSD,
          estimatedCostLocal: transitCostLocal,
          estimatedCostUSD: converted.usd + flightCostUSD,
          estimatedCostCLP: converted.clp + flightCostUSD * rates.USD_TO_CLP,
          notes: `Día de traslado de ${fromName} a ${toName} (~${Math.round(travelHours)} h)`,
        });
      }
    }

    // ── Activity day for this cluster (may include 2-3 attractions) ────────
    if (dayIndex <= tripDays) {
      const baseDaily =
        destination.dailyBaseAccommodationCost + destination.dailyBaseFoodCost;
      // Sum the activity costs of all attractions in this cluster
      const clusterActivityCost = cluster.reduce(
        (sum, a) => sum + a.costPerCouplePerDay,
        0
      );
      const totalLocal = clusterActivityCost + baseDaily;
      const converted = convertCost(totalLocal, destination.currencyCode, rates);

      const attractionNames = cluster.map((a) => a.name).join(" y ");
      const notesText =
        cluster.length > 1
          ? `Visitar: ${attractionNames}`
          : undefined;

      days.push({
        day: dayIndex++,
        isTransitDay: false,
        attractions: cluster,
        estimatedCostLocal: totalLocal,
        estimatedCostUSD: converted.usd,
        estimatedCostCLP: converted.clp,
        notes: notesText,
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
  freeDayCounter = 0;
  const sorted = sortByProximity(selectedAttractions);

  if (sorted.length === 0) {
    // No attractions: fill all days as free exploration
    return Array.from({ length: tripDays }, (_, i) =>
      makeFreDay(i + 1, destination, rates)
    );
  }

  // Determine cluster size:
  // - If tripDays > sorted.length * 2: use single-attraction clusters (spread them out with free days)
  // - Otherwise group 2-3 attractions per cluster to keep itinerary dense
  const clusterSize =
    tripDays > sorted.length * 2
      ? 1
      : Math.min(3, Math.ceil(sorted.length / Math.max(1, Math.ceil(sorted.length / 2))));

  const clusters = clusterAttractions(sorted, clusterSize);

  // Build the core attraction+transit days first
  const { days, daysUsed } = buildClusteredDays(destination, clusters, tripDays, rates);

  const remaining = tripDays - daysUsed;

  if (remaining <= 0) {
    return days;
  }

  // ── Distribute remaining days as free-exploration days ──────────────────
  // Spread free days evenly: some before the first cluster, some between
  // clusters (after each activity day), and the rest at the end.
  // We use (numClusters + 1) slots: before first, between each pair, after last.
  const numActivityDays = days.filter((d) => !d.isTransitDay).length;
  const gapSlots = numActivityDays + 1; // before + between + after
  const freeDaysPerSlot = Math.floor(remaining / gapSlots);
  const extraAtEnd = remaining - freeDaysPerSlot * gapSlots;

  const withFree: ItineraryDay[] = [];
  let newDayNumber = 1;

  // Free days before first attraction
  for (let f = 0; f < freeDaysPerSlot; f++) {
    withFree.push(makeFreDay(newDayNumber++, destination, rates));
  }

  // Walk through the scheduled days, inserting free days after each activity day
  for (let i = 0; i < days.length; i++) {
    const scheduledDay = { ...days[i], day: newDayNumber++ };
    withFree.push(scheduledDay);

    // After each non-transit day (except the very last scheduled day in the list),
    // insert free exploration days
    const isLastScheduled = i === days.length - 1;
    if (!scheduledDay.isTransitDay && !isLastScheduled) {
      for (let f = 0; f < freeDaysPerSlot; f++) {
        withFree.push(makeFreDay(newDayNumber++, destination, rates));
      }
    }
  }

  // Append remaining free days at the end as pure exploration days
  const totalFreeAtEnd = freeDaysPerSlot + extraAtEnd;
  for (let f = 0; f < totalFreeAtEnd; f++) {
    withFree.push(makeFreDay(newDayNumber++, destination, rates));
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
