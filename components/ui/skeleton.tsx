import { cn } from "@/lib/utils";

type SkeletonProps = React.ComponentProps<"div"> & { shimmer?: boolean };

function Skeleton({ className, shimmer, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "skeleton animate-pulse rounded-md",
        className,
        shimmer ? "skeleton-shimmer" : "",
      )}
      {...props}
    />
  );
}

export { Skeleton };
