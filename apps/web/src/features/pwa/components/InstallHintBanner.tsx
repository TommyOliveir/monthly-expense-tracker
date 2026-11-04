"use client";

import { InstallHint } from "@/features/pwa/components/InstallHint";
import { useInstallHint } from "@/features/pwa/hooks/useInstallHint";

/** Shown on every page (logged in or not) until the app is installed or the hint is dismissed. */
export function InstallHintBanner() {
  const { isInstallHintVisible, dismissInstallHint } = useInstallHint();

  if (!isInstallHintVisible) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
      <InstallHint onDismiss={dismissInstallHint} />
    </div>
  );
}
