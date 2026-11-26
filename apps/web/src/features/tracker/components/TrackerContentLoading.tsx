import { TrackerContentSkeleton } from "@/features/tracker/components/TrackerSkeleton";
import { useHasElapsed } from "@/features/tracker/hooks/useHasElapsed";

// A warm API answers in well under a second, so a wait this long means the
// Render instance is starting up after being idle (~1 minute).
export const SLOW_LOAD_HINT_DELAY_MS = 4000;
export const SLOW_LOAD_HINT =
  "Waking up the server. After a break this can take up to a minute.";

/** Skeleton that explains itself when loading takes longer than usual. */
export function TrackerContentLoading() {
  const isSlow = useHasElapsed(SLOW_LOAD_HINT_DELAY_MS);

  return <TrackerContentSkeleton hint={isSlow ? SLOW_LOAD_HINT : undefined} />;
}
