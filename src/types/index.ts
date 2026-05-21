export interface LatLng {
  lat: number;
  lng: number;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  coordinates: LatLng;
  costPerCouplePerDay: number;
  region: string;
  imageUrl?: string;
  rating?: number;  // 1-5 estrellas
}

export interface Destination {
  id: string;
  country: string;
  countryCode: string;
  currency: string;
  currencyCode: string;
  centerCoordinates: LatLng;
  zoom: number;
  regions: string[];
  dailyBaseAccommodationCost: number;
  dailyBaseFoodCost: number;
  attractions: Attraction[];
  flag?: string;
  visaInfo?: string;
  visaFeePerPersonUSD?: number;  // e.g. 35 for Bali VOA; 0 or omitted = visa-free
  bestMonths?: string;
  goodMonths?: number[];   // 1-12, months considered ideal; empty = year-round
  avoidMonths?: number[];  // 1-12, months to avoid
  climate?: string;
  travelTips?: string[];
  freeDayHints?: string[];  // suggestions for free exploration days in itinerary
}

export interface ItineraryDay {
  day: number;
  isTransitDay: boolean;
  attractions: Attraction[];
  travelTimeHours?: number;
  flightCostUSD?: number;  // solo en días de traslado
  estimatedCostLocal: number;
  estimatedCostUSD: number;
  estimatedCostCLP: number;
  notes?: string;
}

export interface CurrencyRates {
  USD_TO_CLP: number;
  USD_TO_JPY: number;
  USD_TO_IDR: number;
  USD_TO_SGD: number;
  USD_TO_THB: number;
  USD_TO_VND: number;
  USD_TO_PHP: number;
  USD_TO_EUR: number;
  [key: string]: number;
}

export interface RouteInfo {
  totalDistanceKm: number;
  totalTimeHours: number;
  segments: {
    from: string;
    to: string;
    distanceKm: number;
    timeHours: number;
  }[];
}
