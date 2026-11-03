import type { CategoryTone } from "@/features/category/types/category";

// Full class names are spelled out so Tailwind can detect them at build time.
export const CATEGORY_TONE_CLASSES: Record<
  CategoryTone,
  { soft: string; solid: string }
> = {
  "chart-1": { soft: "bg-chart-1/15 text-foreground", solid: "bg-chart-1" },
  "chart-2": { soft: "bg-chart-2/20 text-foreground", solid: "bg-chart-2" },
  "chart-3": { soft: "bg-chart-3/20 text-foreground", solid: "bg-chart-3" },
  "chart-4": { soft: "bg-chart-4/15 text-foreground", solid: "bg-chart-4" },
  "chart-5": { soft: "bg-chart-5/15 text-foreground", solid: "bg-chart-5" },
};
