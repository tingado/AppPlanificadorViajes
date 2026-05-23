import { defaultCurrencyRates } from "@/data/destinations";

export function getRate(rates: Record<string, number>, currencyCode: string): number {
  const key = `USD_TO_${currencyCode}`;
  return rates[key] ?? (defaultCurrencyRates as Record<string, number>)[key] ?? 1;
}
