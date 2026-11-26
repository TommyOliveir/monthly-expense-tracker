import { useEffect, useState } from "react";

/** True once `delayMs` has passed since the calling component mounted. */
export function useHasElapsed(delayMs: number): boolean {
  const [hasElapsed, setHasElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasElapsed(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return hasElapsed;
}
