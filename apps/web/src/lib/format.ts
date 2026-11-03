import type { YearMonth } from "@/lib/yearMonth";

// A fixed locale keeps formatting identical between server and client renders.
const LOCALE = "en-US";

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency }).format(
    amount,
  );
}

export function getCurrencySymbol(currency: string): string {
  const parts = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);

  return parts.find((part) => part.type === "currency")?.value ?? currency;
}

export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(ratio);
}

export function formatMonthLabel({ year, month }: YearMonth): string {
  return new Intl.DateTimeFormat(LOCALE, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * Expense dates are calendar dates stored as UTC midnight, so they must be
 * formatted in UTC or they shift by a day in negative-offset time zones.
 */
export function formatCalendarDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}
