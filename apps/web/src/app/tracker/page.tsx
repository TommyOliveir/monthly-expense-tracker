import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackerScreen } from "@/features/tracker/components/TrackerScreen";
import { TrackerSkeleton } from "@/features/tracker/components/TrackerSkeleton";

export const metadata: Metadata = {
  title: "Tracker · IPON Ledger",
};

export default function TrackerPage() {
  // TrackerScreen reads `?month=` via useSearchParams, which needs a Suspense boundary.
  return (
    <Suspense fallback={<TrackerSkeleton />}>
      <TrackerScreen />
    </Suspense>
  );
}
