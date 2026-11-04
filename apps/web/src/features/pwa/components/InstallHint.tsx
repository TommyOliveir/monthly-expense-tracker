import { ShareIcon, SquarePlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/features/pwa/appMetadata";

type InstallHintProps = {
  onDismiss: () => void;
};

export function InstallHint({ onDismiss }: InstallHintProps) {
  return (
    <section
      aria-label={`Install ${APP_NAME}`}
      className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-xs"
    >
      <span
        aria-hidden
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-foreground"
      >
        <SquarePlusIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">Install {APP_NAME} on your iPhone</p>
        <p className="mt-0.5 text-muted-foreground">
          Tap{" "}
          <ShareIcon
            aria-label="Share"
            className="inline size-4 align-text-bottom"
          />{" "}
          Share, then{" "}
          <span className="font-medium text-foreground">
            Add to Home Screen
          </span>
          .
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="-mt-1 -mr-2 size-9 shrink-0"
        aria-label="Dismiss install hint"
        onClick={onDismiss}
      >
        <XIcon aria-hidden />
      </Button>
    </section>
  );
}
