import { describe, expect, it } from "vitest";
import { parseAmount } from "@/lib/money";

describe("parseAmount", () => {
  it.each([
    ["12", 12],
    ["12.5", 12.5],
    ["  1,250.75 ", 1250.75],
    ["0.01", 0.01],
  ])("accepts %j", (input, expected) => {
    expect(parseAmount(input)).toEqual({ ok: true, value: expected });
  });

  it.each([
    ["", "Enter an amount."],
    ["   ", "Enter an amount."],
    ["abc", "Enter a valid number, like 12.50."],
    ["-5", "Enter a valid number, like 12.50."],
    ["1e3", "Enter a valid number, like 12.50."],
    ["12.345", "Use at most 2 decimal places."],
    ["0", "Amount must be greater than zero."],
    ["0.00", "Amount must be greater than zero."],
    ["10000000000", "That amount is too large."],
  ])("rejects %j", (input, error) => {
    expect(parseAmount(input)).toEqual({ ok: false, error });
  });
});
