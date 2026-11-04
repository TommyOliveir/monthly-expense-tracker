"use client";

import { useState } from "react";
import { toast } from "sonner";
import { APP_NAME } from "@/features/pwa/appMetadata";
import { InstallHint } from "@/features/pwa/components/InstallHint";
import { IosInstallGuideDialog } from "@/features/pwa/components/IosInstallGuideDialog";
import { useInstallHint } from "@/features/pwa/hooks/useInstallHint";
import type { IosInstallGuideContext } from "@/features/pwa/types/installPrompt";
import { getLikelySafariShareLayout } from "@/features/pwa/utils/getLikelySafariShareLayout";

const DEFAULT_GUIDE_CONTEXT: IosInstallGuideContext = {
  primaryLayout: "bottom-toolbar",
  siteHost: "",
};

/** Shown on every page (logged in or not) until the app is installed; closing hides it until reload. */
export function InstallHintBanner() {
  const {
    installMethod,
    isInstallHintVisible,
    dismissInstallHint,
    promptInstall,
  } = useInstallHint();
  const [isIosGuideOpen, setIsIosGuideOpen] = useState(false);
  // Kept after closing so the dialog's exit animation still has its content.
  const [guideContext, setGuideContext] = useState(DEFAULT_GUIDE_CONTEXT);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (installMethod === "ios-manual") {
      setGuideContext({
        primaryLayout: getLikelySafariShareLayout(navigator.userAgent),
        siteHost: window.location.host,
      });
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
        primaryLayout={guideContext.primaryLayout}
        siteHost={guideContext.siteHost}
      />
    </>
  );
}
