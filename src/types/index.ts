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
  bestMonths?: string;
  climate?: string;
  travelTips?: string[];
}

export interface ItineraryDay {
  day: number;
  isTransitDay: boolean;
  attractions: Attraction[];
  travelTimeHours?: number;
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
