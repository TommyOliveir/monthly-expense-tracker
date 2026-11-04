import type { ReactNode } from "react";
import { EllipsisIcon, ShareIcon, SquarePlusIcon } from "lucide-react";
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

type IosInstallGuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type InstallStep = {
  icon: ReactNode;
  content: ReactNode;
};

const INSTALL_STEPS: InstallStep[] = [
  {
    icon: <ShareIcon aria-hidden className="size-4" />,
    content: (
      <>
        Tap the <strong className="font-medium">Share</strong> button in Safari.
        If you don&apos;t see it, tap{" "}
        <EllipsisIcon aria-label="More" className="inline size-4" /> first.
      </>
    ),
  },
  {
    icon: <SquarePlusIcon aria-hidden className="size-4" />,
    content: (
      <>
        Scroll down and tap{" "}
        <strong className="font-medium">Add to Home Screen</strong>.
      </>
    ),
  },
  {
    icon: (
      <span aria-hidden className="text-xs font-semibold">
        Add
      </span>
    ),
    content: (
      <>
        Tap <strong className="font-medium">Add</strong>. {APP_SHORT_NAME}{" "}
        appears on your Home Screen and opens full screen.
      </>
    ),
  },
];

/** iOS doesn't let websites install themselves, so this walks through Safari's own steps. */
export function IosInstallGuideDialog({
  open,
  onOpenChange,
}: IosInstallGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Install {APP_NAME}
          </DialogTitle>
          <DialogDescription>
            iPhone installs web apps from Safari&apos;s Share menu.
          </DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-4">
          {INSTALL_STEPS.map((step, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-foreground">
                {step.icon}
              </span>
              <p className="pt-1.5">
                <span className="sr-only">Step {index + 1}: </span>
                {step.content}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">
          Using an app&apos;s built-in browser (like Messenger or Gmail)? Open
          this page in Safari first.
        </p>
        <DialogFooter>
          <DialogClose render={<Button className="h-10 px-4" />}>
            Got it
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
