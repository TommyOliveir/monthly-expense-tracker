import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadStore() {
  vi.resetModules();
  return import("@/features/currency/currencyStore");
}

describe("currencyStore", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("defaults to USD when nothing is stored", async () => {
    const store = await loadStore();
    expect(store.getCurrency()).toBe("USD");
  });

  it("restores a stored currency and ignores unsupported values", async () => {
    localStorage.setItem("currency", "PHP");
    expect((await loadStore()).getCurrency()).toBe("PHP");

    localStorage.setItem("currency", "HUF");
    expect((await loadStore()).getCurrency()).toBe("HUF");

    localStorage.setItem("currency", "DOGE");
    expect((await loadStore()).getCurrency()).toBe("USD");
  });

  it("persists changes and notifies subscribers", async () => {
    const store = await loadStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribeToCurrency(listener);

    store.setCurrency("EUR");

    expect(store.getCurrency()).toBe("EUR");
    expect(localStorage.getItem("currency")).toBe("EUR");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.setCurrency("GBP");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("still switches currency when storage is blocked", async () => {
    const store = await loadStore();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    expect(() => store.setCurrency("JPY")).not.toThrow();
    expect(store.getCurrency()).toBe("JPY");
  });

  it("syncs a change made in another tab", async () => {
    const store = await loadStore();
    const listener = vi.fn();
    store.subscribeToCurrency(listener);

    window.dispatchEvent(
      new StorageEvent("storage", { key: "currency", newValue: "SGD" }),
    );

    expect(store.getCurrency()).toBe("SGD");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
