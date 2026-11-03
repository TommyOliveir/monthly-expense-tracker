import { describe, expect, it } from "vitest";
import {
  compareYearMonth,
  getDefaultExpenseDate,
  getLastDateOfMonth,
  isDateInYearMonth,
  parseYearMonth,
  shiftYearMonth,
  toLocalDateInputValue,
  toYearMonthParam,
} from "@/lib/yearMonth";

describe("yearMonth helpers", () => {
  it("parses and serializes YYYY-MM", () => {
    expect(parseYearMonth("2026-03")).toEqual({ year: 2026, month: 3 });
    expect(toYearMonthParam({ year: 2026, month: 3 })).toBe("2026-03");
  });

  it.each([null, "", "2026-13", "2026-00", "2026-3", "march", "1900-01"])(
    "rejects malformed month param %j",
    (value) => {
      expect(parseYearMonth(value)).toBeNull();
    },
  );

  it("shifts across year boundaries", () => {
    expect(shiftYearMonth({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
    expect(shiftYearMonth({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
  });

  it("compares months", () => {
    expect(
      compareYearMonth({ year: 2026, month: 2 }, { year: 2026, month: 3 }),
    ).toBeLessThan(0);
    expect(
      compareYearMonth({ year: 2026, month: 3 }, { year: 2026, month: 3 }),
    ).toBe(0);
  });

  it("uses the local calendar date, not UTC", () => {
    // 00:30 local time on Nov 1 must stay Nov 1 regardless of the UTC offset.
    expect(toLocalDateInputValue(new Date(2026, 10, 1, 0, 30))).toBe(
      "2026-11-01",
    );
  });

  it("defaults the expense date to today in the current month, else the 1st", () => {
    const now = new Date(2026, 10, 3, 9, 0);
    expect(getDefaultExpenseDate({ year: 2026, month: 11 }, now)).toBe(
      "2026-11-03",
    );
    expect(getDefaultExpenseDate({ year: 2026, month: 12 }, now)).toBe(
      "2026-12-01",
    );
  });

  it("knows month lengths, including leap years", () => {
    expect(getLastDateOfMonth({ year: 2028, month: 2 })).toBe("2028-02-29");
    expect(getLastDateOfMonth({ year: 2026, month: 2 })).toBe("2026-02-28");
  });

  it("checks whether a date belongs to a month", () => {
    expect(isDateInYearMonth("2026-11-30", { year: 2026, month: 11 })).toBe(
      true,
    );
    expect(isDateInYearMonth("2026-12-01", { year: 2026, month: 11 })).toBe(
      false,
    );
  });
});
