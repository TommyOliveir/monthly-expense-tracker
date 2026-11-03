export type YearMonth = {
  year: number;
  month: number;
};

const YEAR_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

function padTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

export function getCurrentYearMonth(now: Date = new Date()): YearMonth {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Parses a "YYYY-MM" string. Returns null for anything malformed or out of range. */
export function parseYearMonth(
  value: string | null | undefined,
): YearMonth | null {
  if (!value) return null;

  const match = YEAR_MONTH_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 1970) return null;

  return { year, month };
}

export function toYearMonthParam({ year, month }: YearMonth): string {
  return `${year}-${padTwoDigits(month)}`;
}

export function shiftYearMonth(
  { year, month }: YearMonth,
  delta: number,
): YearMonth {
  const zeroBasedIndex = year * 12 + (month - 1) + delta;
  return {
    year: Math.floor(zeroBasedIndex / 12),
    month: (zeroBasedIndex % 12) + 1,
  };
}

/** Negative when `first` is earlier, positive when later, 0 when equal. */
export function compareYearMonth(first: YearMonth, second: YearMonth): number {
  return first.year * 12 + first.month - (second.year * 12 + second.month);
}

/** Local calendar date as "YYYY-MM-DD" (what `<input type="date">` expects). */
export function toLocalDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`;
}

export function getFirstDateOfMonth({ year, month }: YearMonth): string {
  return `${year}-${padTwoDigits(month)}-01`;
}

export function getLastDateOfMonth({ year, month }: YearMonth): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${padTwoDigits(month)}-${padTwoDigits(lastDay)}`;
}

/** Today when viewing the current month, otherwise the 1st of the viewed month. */
export function getDefaultExpenseDate(
  period: YearMonth,
  now: Date = new Date(),
): string {
  const today = toLocalDateInputValue(now);
  const isCurrentMonth =
    compareYearMonth(period, getCurrentYearMonth(now)) === 0;
  return isCurrentMonth ? today : getFirstDateOfMonth(period);
}

export function isDateInYearMonth(
  dateValue: string,
  period: YearMonth,
): boolean {
  return dateValue.startsWith(`${toYearMonthParam(period)}-`);
}
