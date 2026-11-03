import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoryBreakdownItem } from "@/features/category/types/category";
import { CATEGORY_TONE_CLASSES } from "@/features/category/utils/categoryToneClasses";
import { getCategoryTone } from "@/features/category/utils/getCategoryTone";
import type { CurrencyCode } from "@/features/currency/currencies";

type CategoryBreakdownProps = {
  items: CategoryBreakdownItem[];
  currency: CurrencyCode;
  className?: string;
};

export function CategoryBreakdown({
  items,
  currency,
  className,
}: CategoryBreakdownProps) {
  return (
    <Card className={cn("gap-5 py-6", className)}>
      <CardHeader className="px-5 sm:px-6">
        <CardTitle className="font-display text-xl font-medium">
          Where it went
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your spending by category will show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {items.map((item) => {
              const toneClasses =
                CATEGORY_TONE_CLASSES[getCategoryTone(item.categoryId)];

              return (
                <li key={item.categoryId}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          toneClasses.solid,
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      <span className="font-semibold">
                        {formatCurrency(item.total, currency)}
                      </span>
                      <span className="ml-2 inline-block w-10 text-right text-muted-foreground">
                        {formatPercent(item.share)}
                      </span>
                    </span>
                  </div>
                  <div
                    aria-hidden
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={cn("h-full rounded-full", toneClasses.solid)}
                      style={{ width: `${Math.max(item.share * 100, 2)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
