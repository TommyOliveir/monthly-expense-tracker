import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  EllipsisIcon,
  LockIcon,
  ShareIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SafariShareLayout } from "@/features/pwa/types/installPrompt";

type SafariShareIllustrationProps = {
  layout: SafariShareLayout;
  siteHost: string;
  className?: string;
};

const HIGHLIGHT_CLASS =
  "rounded-full bg-brand/15 p-1 text-brand-foreground ring-2 ring-brand";

/** Simplified drawing of Safari's bar with the button to tap highlighted. */
export function SafariShareIllustration({
  layout,
  siteHost,
  className,
}: SafariShareIllustrationProps) {
  if (layout === "address-bar-menu") {
    return (
      <div
        aria-hidden
        className={cn(
          "flex items-center gap-2 rounded-2xl border bg-muted px-2.5 py-2 text-muted-foreground",
          className,
        )}
      >
        <ChevronLeftIcon className="size-4 shrink-0" />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-background px-3 py-1 text-xs text-foreground">
          <LockIcon className="size-3 shrink-0" />
          <span className="truncate">{siteHost}</span>
        </div>
        <span className={HIGHLIGHT_CLASS}>
          <EllipsisIcon className="size-4" />
        </span>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-around rounded-2xl border bg-muted px-2.5 py-2 text-muted-foreground",
        className,
      )}
    >
      <ChevronLeftIcon className="size-4" />
      <ChevronRightIcon className="size-4" />
      <span className={HIGHLIGHT_CLASS}>
        <ShareIcon className="size-4" />
      </span>
      <BookOpenIcon className="size-4" />
      <CopyIcon className="size-4" />
    </div>
  );
}
