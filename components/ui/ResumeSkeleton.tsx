import { Skeleton } from "@/components/ui/skeleton";

export function ResumeSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6 bg-white min-h-[400px]">
      {/* Header / Name */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-xl shrink-0" shimmer />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48 rounded" shimmer />
          <Skeleton className="h-4 w-64 rounded" shimmer />
          <div className="flex gap-3 pt-1">
            <Skeleton className="h-3 w-24 rounded" shimmer />
            <Skeleton className="h-3 w-32 rounded" shimmer />
            <Skeleton className="h-3 w-28 rounded" shimmer />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-5 w-24 rounded" shimmer />
        <Skeleton className="h-4 w-full rounded" shimmer />
        <Skeleton className="h-4 w-5/6 rounded" shimmer />
        <Skeleton className="h-4 w-4/6 rounded" shimmer />
      </div>

      {/* Experience */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-5 w-28 rounded" shimmer />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40 rounded" shimmer />
              <Skeleton className="h-3 w-24 rounded" shimmer />
            </div>
            <Skeleton className="h-3 w-32 rounded" shimmer />
            <Skeleton className="h-3 w-full rounded" shimmer />
            <Skeleton className="h-3 w-5/6 rounded" shimmer />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-36 rounded" shimmer />
              <Skeleton className="h-3 w-24 rounded" shimmer />
            </div>
            <Skeleton className="h-3 w-28 rounded" shimmer />
            <Skeleton className="h-3 w-full rounded" shimmer />
            <Skeleton className="h-3 w-4/6 rounded" shimmer />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-5 w-16 rounded" shimmer />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" shimmer />
          <Skeleton className="h-6 w-24 rounded-full" shimmer />
          <Skeleton className="h-6 w-16 rounded-full" shimmer />
          <Skeleton className="h-6 w-28 rounded-full" shimmer />
          <Skeleton className="h-6 w-18 rounded-full" shimmer />
        </div>
      </div>
    </div>
  );
}
