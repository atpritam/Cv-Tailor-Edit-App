import { Skeleton } from "@/components/ui/skeleton";

export function ResumeSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-4">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <Skeleton className="h-[150px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
      <Skeleton className="h-[100px] w-full rounded-xl" />
    </div>
  );
}
