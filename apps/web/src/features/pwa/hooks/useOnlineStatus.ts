import { useSyncExternalStore } from "react";

function subscribeToConnection(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getIsOnline(): boolean {
  return navigator.onLine;
}

function getServerIsOnline(): boolean {
  return true;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeToConnection,
    getIsOnline,
    getServerIsOnline,
  );
}
