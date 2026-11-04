"use client";

import { useState } from "react";
import { toast } from "sonner";
import { APP_NAME } from "@/features/pwa/appMetadata";
import { InstallHint } from "@/features/pwa/components/InstallHint";
import { IosInstallGuideDialog } from "@/features/pwa/components/IosInstallGuideDialog";
import { useInstallHint } from "@/features/pwa/hooks/useInstallHint";

/** Shown on every page (logged in or not) until the app is installed; closing hides it until reload. */
export function InstallHintBanner() {
  const {
    installMethod,
    isInstallHintVisible,
    dismissInstallHint,
    promptInstall,
  } = useInstallHint();
  const [isIosGuideOpen, setIsIosGuideOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (installMethod === "ios-manual") {
      setIsIosGuideOpen(true);
      return;
    }

    setIsInstalling(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "accepted") toast.success(`Installing ${APP_NAME}…`);
    } catch (error) {
      console.error("Install prompt failed:", error);
      toast.error("Couldn't open the install prompt. Try your browser menu.");
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      {isInstallHintVisible && installMethod && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
          <InstallHint
            installMethod={installMethod}
            isInstalling={isInstalling}
            onInstall={handleInstall}
            onDismiss={dismissInstallHint}
          />
        </div>
      )}
      <IosInstallGuideDialog
        open={isIosGuideOpen}
        onOpenChange={setIsIosGuideOpen}
      />
    </>
  );
}
