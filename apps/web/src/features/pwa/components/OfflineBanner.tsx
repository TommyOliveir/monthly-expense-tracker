"use client";

import { WifiOffIcon } from "lucide-react";
import { useOnlineStatus } from "@/features/pwa/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  // The live region stays mounted so screen readers announce the change.
  return (
    <div role="status" aria-live="polite">
      {!isOnline && (
        <p className="flex items-center justify-center gap-2 border-b bg-warning/10 px-4 py-2 text-center text-sm text-warning">
          <WifiOffIcon aria-hidden className="size-4 shrink-0" />
          You&apos;re offline. Changes need a connection.
        </p>
      )}
    </div>
  );
}
