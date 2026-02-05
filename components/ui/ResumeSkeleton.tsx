import { Skeleton } from "@/components/ui/skeleton";

export function ResumeSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse">
      {/* Header section */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-md" shimmer />
        <div className="flex gap-3 flex-wrap">
          <Skeleton className="h-4 w-32 rounded" shimmer />
          <Skeleton className="h-4 w-28 rounded" shimmer />
          <Skeleton className="h-4 w-36 rounded" shimmer />
        </div>
      </div>

      {/* Summary section */}
      <div className="space-y-2 pt-4 border-t border-border/50">
        <Skeleton className="h-4 w-24 rounded" shimmer />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full rounded" shimmer />
          <Skeleton className="h-3.5 w-full rounded" shimmer />
          <Skeleton className="h-3.5 w-3/4 rounded" shimmer />
        </div>
      </div>

      {/* Experience section */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <Skeleton className="h-4 w-28 rounded" shimmer />
        
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-40 rounded" shimmer />
            <Skeleton className="h-4 w-24 rounded" shimmer />
          </div>
          <Skeleton className="h-4 w-32 rounded" shimmer />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-full rounded" shimmer />
            <Skeleton className="h-3.5 w-full rounded" shimmer />
            <Skeleton className="h-3.5 w-5/6 rounded" shimmer />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-36 rounded" shimmer />
            <Skeleton className="h-4 w-20 rounded" shimmer />
          </div>
          <Skeleton className="h-4 w-28 rounded" shimmer />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-full rounded" shimmer />
            <Skeleton className="h-3.5 w-4/5 rounded" shimmer />
          </div>
        </div>
      </div>

      {/* Skills section */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <Skeleton className="h-4 w-20 rounded" shimmer />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-6 w-16 rounded-full" shimmer />
          <Skeleton className="h-6 w-20 rounded-full" shimmer />
          <Skeleton className="h-6 w-14 rounded-full" shimmer />
          <Skeleton className="h-6 w-18 rounded-full" shimmer />
          <Skeleton className="h-6 w-22 rounded-full" shimmer />
        </div>
      </div>
    </div>
  );
}
