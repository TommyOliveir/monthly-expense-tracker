import type {
  BeforeInstallPromptEvent,
  InstallOutcome,
} from "@/features/pwa/types/installPrompt";

type InstallListener = () => void;

const listeners = new Set<InstallListener>();

let deferredPrompt: BeforeInstallPromptEvent | null = null;
// In memory on purpose: closing the hint hides it until the next page load.
let isDismissed = false;

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function handleBeforeInstallPrompt(event: Event): void {
  // Keep the browser's mini-infobar away; our Install button triggers the prompt instead.
  event.preventDefault();
  deferredPrompt = event as BeforeInstallPromptEvent;
  notify();
}

export function handleAppInstalled(): void {
  deferredPrompt = null;
  notify();
}

// Registered at module load, because the event can fire before React mounts.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
}

export function getCanPromptInstall(): boolean {
  return deferredPrompt !== null;
}

export function getIsInstallHintDismissed(): boolean {
  return isDismissed;
}

export function dismissInstallHint(): void {
  isDismissed = true;
  notify();
}

export async function promptInstall(): Promise<InstallOutcome> {
  const installEvent = deferredPrompt;
  if (!installEvent) return "unavailable";

  // A prompt event can only be used once.
  deferredPrompt = null;
  notify();

  await installEvent.prompt();
  const { outcome } = await installEvent.userChoice;
  return outcome;
}

export function subscribeToInstallPrompt(
  listener: InstallListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test helper: restore the state of a fresh page load. */
export function resetInstallPromptForTests(): void {
  deferredPrompt = null;
  isDismissed = false;
}
