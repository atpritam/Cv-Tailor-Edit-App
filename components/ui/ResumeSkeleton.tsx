import { Skeleton } from "@/components/ui/skeleton";

export function ResumeSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6 bg-white">
      {/* Header section */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-24 w-24 rounded-xl shrink-0" shimmer />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48" shimmer />
          <Skeleton className="h-4 w-36" shimmer />
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-3 w-32" shimmer />
            <Skeleton className="h-3 w-28" shimmer />
            <Skeleton className="h-3 w-24" shimmer />
          </div>
        </div>
      </div>

      {/* Summary section */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-5 w-32" shimmer />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3 w-full" shimmer />
          <Skeleton className="h-3 w-full" shimmer />
          <Skeleton className="h-3 w-3/4" shimmer />
        </div>
      </div>

      {/* Experience section */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-5 w-28" shimmer />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40" shimmer />
              <Skeleton className="h-3 w-24" shimmer />
            </div>
            <Skeleton className="h-3 w-32" shimmer />
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-3 w-full" shimmer />
              <Skeleton className="h-3 w-full" shimmer />
              <Skeleton className="h-3 w-2/3" shimmer />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-36" shimmer />
              <Skeleton className="h-3 w-24" shimmer />
            </div>
            <Skeleton className="h-3 w-28" shimmer />
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-3 w-full" shimmer />
              <Skeleton className="h-3 w-5/6" shimmer />
            </div>
          </div>
        </div>
      </div>

      {/* Skills section */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-5 w-20" shimmer />
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" shimmer />
          <Skeleton className="h-6 w-20 rounded-full" shimmer />
          <Skeleton className="h-6 w-14 rounded-full" shimmer />
          <Skeleton className="h-6 w-18 rounded-full" shimmer />
          <Skeleton className="h-6 w-12 rounded-full" shimmer />
        </div>
      </div>
    </div>
  );
}
