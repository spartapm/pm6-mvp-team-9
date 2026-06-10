import Skeleton from "@/components/ui/Skeleton";

export default function CreatorDetailSkeleton() {
  return (
    <div className="px-4 pb-4 pt-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-[70px] w-[70px] shrink-0 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-12 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-[30px] flex-1 rounded-[10px]" />
        <Skeleton className="h-[30px] w-[30px] rounded-[10px]" />
        <Skeleton className="h-[30px] w-[30px] rounded-[10px]" />
      </div>
      <Skeleton className="mt-4 h-[74px] w-full rounded-[10px]" />
      <div className="mt-4 flex max-h-[62px] flex-wrap gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-3 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[87px] w-[100px] shrink-0 rounded-[5px]" />
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mt-3 h-28 w-full rounded-[10px]" />
      <div className="mt-6 flex border-b border-[#eee] pb-2.5">
        <Skeleton className="mx-auto h-5 w-12" />
        <Skeleton className="mx-auto h-5 w-12" />
      </div>
      <div className="mt-0.5 grid grid-cols-3 gap-0.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}
