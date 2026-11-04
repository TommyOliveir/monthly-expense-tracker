type DismissListener = () => void;

const STORAGE_KEY = "pwa-install-hint-dismissed";

const listeners = new Set<DismissListener>();

// Fallback for when storage is blocked: the dismissal lasts for this session.
let isDismissedInMemory = false;

export function isInstallHintDismissed(): boolean {
  if (isDismissedInMemory) return true;

  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function dismissInstallHint(): void {
  isDismissedInMemory = true;

  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Can't persist: the in-memory flag keeps it hidden for this session.
  }
  listeners.forEach((listener) => listener());
}

/** Test helper: forget a dismissal made earlier in the same module instance. */
export function resetInstallHintForTests(): void {
  isDismissedInMemory = false;
}

export function subscribeToInstallHint(listener: DismissListener): () => void {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}
