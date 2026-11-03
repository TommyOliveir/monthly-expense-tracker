import { describe, expect, it } from "vitest";
import {
  formatCalendarDate,
  formatCurrency,
  formatMonthLabel,
  formatPercent,
  getCurrencySymbol,
} from "@/lib/format";

describe("format helpers", () => {
  it("formats money in the chosen currency", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
    expect(formatCurrency(1234.5, "PHP")).toBe("₱1,234.50");
    expect(formatCurrency(1234, "JPY")).toBe("¥1,234");
    expect(formatCurrency(12345.5, "HUF")).toBe("HUF\u00a012,345.50");
  });

  it("returns a short currency symbol for input prefixes", () => {
    expect(getCurrencySymbol("PHP")).toBe("₱");
    expect(getCurrencySymbol("EUR")).toBe("€");
    expect(getCurrencySymbol("HUF")).toBe("Ft");
  });

  it("formats months and percentages", () => {
    expect(formatMonthLabel({ year: 2026, month: 11 })).toBe("November 2026");
    expect(formatPercent(0.425)).toBe("43%");
  });

  it("formats stored UTC-midnight dates without shifting the day", () => {
    expect(formatCalendarDate("2026-11-02T00:00:00.000Z")).toBe("Mon, Nov 2");
  });
});
