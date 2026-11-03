import { cn } from "@/lib/utils";
import type { CategoryTone } from "@/features/category/types/category";
import { CATEGORY_TONE_CLASSES } from "@/features/category/utils/categoryToneClasses";

type CategoryAvatarProps = {
  name: string;
  tone: CategoryTone;
  className?: string;
};

export function CategoryAvatar({ name, tone, className }: CategoryAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold",
        CATEGORY_TONE_CLASSES[tone].soft,
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
