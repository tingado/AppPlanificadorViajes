import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Attraction, Destination, ItineraryDay, CurrencyRates, RouteInfo } from "@/types";
import { destinations, defaultCurrencyRates } from "@/data/destinations";
import { generateItinerary } from "@/utils/itineraryGenerator";
import { buildRouteInfo } from "@/utils/geo";

const MAX_PINS = 3;

interface TravelState {
  // Destination selection
  selectedDestination: Destination | null;
  setSelectedDestination: (destination: Destination | null) => void;

  // Pin management (max 3)
  activePins: Attraction[];
  toggleAttraction: (attraction: Attraction) => void;
  clearPins: () => void;

  // Route
  routeInfo: RouteInfo | null;
  showRoute: boolean;
  calculateRoute: () => void;
  clearRoute: () => void;

  // Itinerary planner
  tripDays: number;
  setTripDays: (days: number) => void;
  generatedItinerary: ItineraryDay[];
  generateItineraryAction: () => void;

  // Currency
  currencyRates: CurrencyRates;
  setCurrencyRates: (rates: Partial<CurrencyRates>) => void;

  // UI state
  mobilePanel: "map" | "controls";
  setMobilePanel: (panel: "map" | "controls") => void;
  activeTab: "attractions" | "itinerary" | "costs";
  setActiveTab: (tab: "attractions" | "itinerary" | "costs") => void;

  // Pin limit alert
  pinLimitReached: boolean;
  setPinLimitReached: (v: boolean) => void;
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      selectedDestination: null,
      setSelectedDestination: (destination) => {
        set({ selectedDestination: destination, activePins: [], routeInfo: null, showRoute: false, generatedItinerary: [] });
      },

      activePins: [],
      pinLimitReached: false,
      setPinLimitReached: (v) => set({ pinLimitReached: v }),

      toggleAttraction: (attraction) => {
        const { activePins } = get();
        const isActive = activePins.some((p) => p.id === attraction.id);

        if (isActive) {
          set({ activePins: activePins.filter((p) => p.id !== attraction.id), routeInfo: null, showRoute: false });
          return;
        }

        if (activePins.length >= MAX_PINS) {
          // Replace oldest pin and alert
          const newPins = [...activePins.slice(1), attraction];
          set({ activePins: newPins, pinLimitReached: true, routeInfo: null, showRoute: false });
          setTimeout(() => get().setPinLimitReached(false), 3000);
          return;
        }

        set({ activePins: [...activePins, attraction], routeInfo: null, showRoute: false });
      },

      clearPins: () => set({ activePins: [], routeInfo: null, showRoute: false }),

      routeInfo: null,
      showRoute: false,
      calculateRoute: () => {
        const { activePins } = get();
        if (activePins.length < 2) return;
        const info = buildRouteInfo(activePins);
        set({ routeInfo: info, showRoute: true });
      },
      clearRoute: () => set({ routeInfo: null, showRoute: false }),

      tripDays: 7,
      setTripDays: (days) => set({ tripDays: days, generatedItinerary: [] }),

      generatedItinerary: [],
      generateItineraryAction: () => {
        const { selectedDestination, activePins, tripDays, currencyRates } = get();
        if (!selectedDestination || activePins.length === 0) return;
        const itinerary = generateItinerary(selectedDestination, activePins, tripDays, currencyRates);
        set({ generatedItinerary: itinerary });
      },

      currencyRates: defaultCurrencyRates,
      setCurrencyRates: (rates) =>
        set((s) => ({ currencyRates: { ...s.currencyRates, ...rates } as CurrencyRates })),

      mobilePanel: "map",
      setMobilePanel: (panel) => set({ mobilePanel: panel }),

      activeTab: "attractions",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "travel-planner-store",
      skipHydration: true,
      partialize: (state) => ({
        selectedDestination: state.selectedDestination,
        activePins: state.activePins,
        tripDays: state.tripDays,
        generatedItinerary: state.generatedItinerary,
        currencyRates: state.currencyRates,
      }),
    }
  )
);

export { destinations };
