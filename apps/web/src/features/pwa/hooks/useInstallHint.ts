import { useSyncExternalStore } from "react";
import { useIsStandalone } from "@/features/pwa/hooks/useIsStandalone";
import { isIosDevice } from "@/features/pwa/utils/isIosDevice";
import {
  dismissInstallHint,
  isInstallHintDismissed,
  subscribeToInstallHint,
} from "@/features/pwa/utils/installHintStorage";

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

/**
 * iOS has no install prompt event, so Safari users get a manual
 * "Share → Add to Home Screen" hint until they install or dismiss it.
 */
export function useInstallHint() {
  const isIos = useSyncExternalStore(
    subscribeToNothing,
    getIsIosDevice,
    getServerFalse,
  );
  const isStandalone = useIsStandalone();
  const isDismissed = useSyncExternalStore(
    subscribeToInstallHint,
    isInstallHintDismissed,
    getServerTrue,
  );

  return {
    isInstallHintVisible: isIos && !isStandalone && !isDismissed,
    dismissInstallHint,
  };
}
