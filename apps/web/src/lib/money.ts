// Money columns are Decimal(12,2) in the database.
const MAX_AMOUNT = 9_999_999_999.99;
const AMOUNT_PATTERN = /^\d+(\.\d+)?$/;

export type ParsedAmount =
  { ok: true; value: number } | { ok: false; error: string };

export function parseAmount(input: string): ParsedAmount {
  const trimmed = input.trim().replace(/,/g, "");

  if (!trimmed) {
    return { ok: false, error: "Enter an amount." };
  }

  if (!AMOUNT_PATTERN.test(trimmed)) {
    return { ok: false, error: "Enter a valid number, like 12.50." };
  }

  const [, decimals = ""] = trimmed.split(".");
  if (decimals.length > 2) {
    return { ok: false, error: "Use at most 2 decimal places." };
  }

  const value = Number(trimmed);

  if (value <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }

  if (value > MAX_AMOUNT) {
    return { ok: false, error: "That amount is too large." };
  }

  return { ok: true, value };
}
