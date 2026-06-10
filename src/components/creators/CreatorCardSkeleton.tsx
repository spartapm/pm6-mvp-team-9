import Skeleton from "@/components/ui/Skeleton";

export default function CreatorCardSkeleton() {
  return (
    <div className="flex gap-3 border-b border-[#f0f0f0] px-4 py-4">
      <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full max-w-[200px]" />
        <Skeleton className="h-3 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-3 w-8" />
    </div>
  );
}
