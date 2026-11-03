import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  compareYearMonth,
  getCurrentYearMonth,
  parseYearMonth,
  toYearMonthParam,
  type YearMonth,
} from "@/lib/yearMonth";

const MONTH_PARAM = "month";

/** The viewed month lives in `?month=YYYY-MM` so refresh and back/forward keep it. */
export function useSelectedMonth() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentMonth = getCurrentYearMonth();
  const selectedMonth =
    parseYearMonth(searchParams.get(MONTH_PARAM)) ?? currentMonth;

  const setSelectedMonth = useCallback(
    (next: YearMonth) => {
      const params = new URLSearchParams(searchParams.toString());

      if (compareYearMonth(next, getCurrentYearMonth()) === 0) {
        params.delete(MONTH_PARAM);
      } else {
        params.set(MONTH_PARAM, toYearMonthParam(next));
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { selectedMonth, currentMonth, setSelectedMonth };
}
