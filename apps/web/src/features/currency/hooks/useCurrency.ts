import { useSyncExternalStore } from "react";
import {
  getCurrency,
  getServerCurrency,
  setCurrency,
  subscribeToCurrency,
} from "@/features/currency/currencyStore";

export function useCurrency() {
  const currency = useSyncExternalStore(
    subscribeToCurrency,
    getCurrency,
    getServerCurrency,
  );

  return { currency, setCurrency };
}
