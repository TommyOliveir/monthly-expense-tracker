export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "HUF", name: "Hungarian Forint" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.some((currency) => currency.code === value);
}

export function getCurrencyName(code: CurrencyCode): string {
  return (
    SUPPORTED_CURRENCIES.find((currency) => currency.code === code)?.name ??
    code
  );
}
