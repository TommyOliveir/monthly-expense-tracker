import { useSyncExternalStore } from "react";
import type { InstallMethod } from "@/features/pwa/types/installPrompt";
import { useIsStandalone } from "@/features/pwa/hooks/useIsStandalone";
import { isIosDevice } from "@/features/pwa/utils/isIosDevice";
import {
  dismissInstallHint,
  getCanPromptInstall,
  getIsInstallHintDismissed,
  promptInstall,
  subscribeToInstallPrompt,
} from "@/features/pwa/utils/installPromptStore";

function subscribeToNothing(): () => void {
  return () => {};
}

function getIsIosDevice(): boolean {
  return isIosDevice({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  });
}

// Server snapshots keep the hint hidden until the client knows the device.
function getServerFalse(): boolean {
  return false;
}

function getServerTrue(): boolean {
  return true;
}

export function useInstallHint() {
  const isIos = useSyncExternalStore(
    subscribeToNothing,
    getIsIosDevice,
    getServerFalse,
  );
  const isStandalone = useIsStandalone();
  const canPromptInstall = useSyncExternalStore(
    subscribeToInstallPrompt,
    getCanPromptInstall,
    getServerFalse,
  );
  const isDismissed = useSyncExternalStore(
    subscribeToInstallPrompt,
    getIsInstallHintDismissed,
    getServerTrue,
  );

  let installMethod: InstallMethod | null = null;
  if (!isStandalone) {
    if (canPromptInstall) installMethod = "native-prompt";
    else if (isIos) installMethod = "ios-manual";
  }

  return {
    installMethod,
    isInstallHintVisible: installMethod !== null && !isDismissed,
    dismissInstallHint,
    promptInstall,
  };
}
