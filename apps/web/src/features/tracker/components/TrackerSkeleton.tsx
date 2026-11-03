import { Skeleton } from "@/components/ui/skeleton";

export function TrackerContentSkeleton() {
  return (
    <div role="status" className="grid gap-4 sm:gap-6 lg:grid-cols-12">
      <span className="sr-only">Loading your month…</span>
      <Skeleton className="h-48 rounded-xl lg:col-span-8" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-4 lg:grid-cols-1">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl lg:col-span-8" />
      <Skeleton className="h-64 rounded-xl lg:col-span-4" />
    </div>
  );
}

export function TrackerSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pt-6 pb-28 sm:px-6 sm:pt-8 sm:pb-12 lg:px-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-64" />
      </div>
      <TrackerContentSkeleton />
    </main>
  );
}
