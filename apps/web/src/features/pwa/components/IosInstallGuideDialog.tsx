import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_NAME, APP_SHORT_NAME } from "@/features/pwa/appMetadata";
import { SafariShareIllustration } from "@/features/pwa/components/SafariShareIllustration";
import type {
  IosInstallGuideContext,
  SafariShareLayout,
} from "@/features/pwa/types/installPrompt";

type IosInstallGuideDialogProps = IosInstallGuideContext & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type InstallStepProps = {
  number: number;
  children: ReactNode;
};

const SHARE_INSTRUCTIONS: Record<
  SafariShareLayout,
  { primary: ReactNode; fallback: ReactNode }
> = {
  "address-bar-menu": {
    primary: (
      <>
        Tap the <strong className="font-medium">⋯</strong> button on the right
        of the address bar, then tap{" "}
        <strong className="font-medium">Share</strong>.
      </>
    ),
    fallback: (
      <>
        No button there? Tap <strong className="font-medium">Share</strong> in
        the toolbar at the bottom.
      </>
    ),
  },
  "bottom-toolbar": {
    primary: (
      <>
        Tap <strong className="font-medium">Share</strong> in the toolbar at the
        bottom of Safari.
      </>
    ),
    fallback: (
      <>
        Only see the address bar? Tap the{" "}
        <strong className="font-medium">⋯</strong> button on its right, then{" "}
        <strong className="font-medium">Share</strong>.
      </>
    ),
  },
};

const OTHER_LAYOUT: Record<SafariShareLayout, SafariShareLayout> = {
  "address-bar-menu": "bottom-toolbar",
  "bottom-toolbar": "address-bar-menu",
};

function InstallStep({ number, children }: InstallStepProps) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand-foreground"
      >
        {number}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <span className="sr-only">Step {number}: </span>
        {children}
      </div>
    </li>
  );
}

/** iOS doesn't let websites install themselves, so this walks through Safari's own steps. */
export function IosInstallGuideDialog({
  open,
  onOpenChange,
  primaryLayout,
  siteHost,
}: IosInstallGuideDialogProps) {
  const shareInstructions = SHARE_INSTRUCTIONS[primaryLayout];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* minmax(0,1fr): without it the grid column grows to fit the long site
          address and the dialog scrolls sideways on small phones. */}
      <DialogContent className="max-h-[calc(100dvh-2rem)] grid-cols-[minmax(0,1fr)] gap-5 overflow-y-auto p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Install {APP_NAME}
          </DialogTitle>
          <DialogDescription>
            iPhone installs web apps from Safari&apos;s Share menu.
          </DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-5">
          <InstallStep number={1}>
            <p>{shareInstructions.primary}</p>
            <SafariShareIllustration
              layout={primaryLayout}
              siteHost={siteHost}
              className="mt-2.5"
            />
            <div className="mt-3 rounded-xl border border-dashed p-3 text-muted-foreground">
              <p>{shareInstructions.fallback}</p>
              <SafariShareIllustration
                layout={OTHER_LAYOUT[primaryLayout]}
                siteHost={siteHost}
                className="mt-2 opacity-80"
              />
            </div>
          </InstallStep>
          <InstallStep number={2}>
            Scroll down the menu and tap{" "}
            <strong className="font-medium">Add to Home Screen</strong>. On some
            iPhones it&apos;s under{" "}
            <strong className="font-medium">View More</strong>.
          </InstallStep>
          <InstallStep number={3}>
            Tap <strong className="font-medium">Add</strong>. {APP_SHORT_NAME}{" "}
            appears on your Home Screen and opens full screen.
          </InstallStep>
        </ol>
        <p className="text-xs text-muted-foreground">
          Using an app&apos;s built-in browser (like Messenger or Gmail)? Open
          this page in Safari first.
        </p>
        <DialogFooter className="-mx-6 -mb-6 px-6">
          <DialogClose render={<Button className="h-10 px-4" />}>
            Got it
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
