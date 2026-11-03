import { describe, expect, it } from "vitest";
import { getBudgetStatus } from "@/features/budget/utils/getBudgetStatus";

describe("getBudgetStatus", () => {
  it.each([
    [0, 0, "unset"],
    [0, 250, "unset"],
    [1000, 0, "on-track"],
    [1000, 849.99, "on-track"],
    [1000, 850, "near-limit"],
    [1000, 1000, "near-limit"],
    [1000, 1000.01, "over"],
  ] as const)("budget %d, spent %d → %s", (budget, spent, expected) => {
    expect(getBudgetStatus(budget, spent)).toBe(expected);
  });
});
