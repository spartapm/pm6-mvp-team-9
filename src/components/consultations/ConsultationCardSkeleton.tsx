import Skeleton from "@/components/ui/Skeleton";

export default function ConsultationCardSkeleton() {
  return (
    <div className="mx-4 mb-3">
      <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-3 w-3" />
        </div>
      </div>
      <Skeleton className="mt-2 h-11 w-full rounded-xl" />
    </div>
  );
}
