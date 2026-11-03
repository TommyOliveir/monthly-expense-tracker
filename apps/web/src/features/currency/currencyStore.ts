import {
  type CurrencyCode,
  DEFAULT_CURRENCY,
  isCurrencyCode,
} from "./currencies";

type CurrencyListener = () => void;

const STORAGE_KEY = "currency";

const listeners = new Set<CurrencyListener>();

function readStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isCurrencyCode(stored) ? stored : DEFAULT_CURRENCY;
  } catch {
    // Storage can be blocked (private mode, disabled cookies): fall back to the default.
    return DEFAULT_CURRENCY;
  }
}

let currency: CurrencyCode = readStoredCurrency();

function notify(): void {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;

    const next = isCurrencyCode(event.newValue)
      ? event.newValue
      : DEFAULT_CURRENCY;
    if (next === currency) return;

    currency = next;
    notify();
  });
}

export function getCurrency(): CurrencyCode {
  return currency;
}

export function getServerCurrency(): CurrencyCode {
  return DEFAULT_CURRENCY;
}

export function setCurrency(next: CurrencyCode): void {
  if (next === currency) return;

  currency = next;

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The choice still applies for this session even if it can't be persisted.
  }

  notify();
}

export function subscribeToCurrency(listener: CurrencyListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
