import { useSyncExternalStore } from "react";

// Safari's non-standard flag for apps launched from the home screen.
type NavigatorWithStandalone = Navigator & { standalone?: boolean };

const STANDALONE_QUERY = "(display-mode: standalone)";

function getStandaloneQuery(): MediaQueryList | null {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(STANDALONE_QUERY)
    : null;
}

function subscribeToDisplayMode(onChange: () => void): () => void {
  const query = getStandaloneQuery();
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
}

function getIsStandalone(): boolean {
  return (
    getStandaloneQuery()?.matches === true ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

function getServerIsStandalone(): boolean {
  return false;
}

export function useIsStandalone(): boolean {
  return useSyncExternalStore(
    subscribeToDisplayMode,
    getIsStandalone,
    getServerIsStandalone,
  );
}
