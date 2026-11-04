import { DownloadIcon, SquarePlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/features/pwa/appMetadata";
import type { InstallMethod } from "@/features/pwa/types/installPrompt";

type InstallHintProps = {
  installMethod: InstallMethod;
  isInstalling?: boolean;
  onInstall: () => void;
  onDismiss: () => void;
};

const INSTALL_COPY: Record<
  InstallMethod,
  { title: string; description: string; action: string }
> = {
  "native-prompt": {
    title: `Install ${APP_NAME}`,
    description: "Open it from your home screen, full screen like an app.",
    action: "Install",
  },
  "ios-manual": {
    title: `Install ${APP_NAME} on your iPhone`,
    description: "Add it to your Home Screen in three taps.",
    action: "Show me how",
  },
};

export function InstallHint({
  installMethod,
  isInstalling = false,
  onInstall,
  onDismiss,
}: InstallHintProps) {
  const copy = INSTALL_COPY[installMethod];

  return (
    <section
      aria-label={`Install ${APP_NAME}`}
      className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-xs sm:items-center"
    >
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-foreground"
      >
        <SquarePlusIcon className="size-4" />
      </span>
      {/* Phones: action sits under the text so the copy keeps its width. */}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{copy.title}</p>
          <p className="mt-0.5 text-muted-foreground">{copy.description}</p>
        </div>
        <Button
          className="h-9 self-start px-3 sm:self-auto"
          onClick={onInstall}
          disabled={isInstalling}
        >
          {installMethod === "native-prompt" && <DownloadIcon aria-hidden />}
          {copy.action}
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="-mt-1 -mr-2 size-9 shrink-0 sm:mt-0"
        aria-label="Dismiss install hint"
        onClick={onDismiss}
      >
        <XIcon aria-hidden />
      </Button>
    </section>
  );
}
