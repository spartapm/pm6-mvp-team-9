import Skeleton from "@/components/ui/Skeleton";

export default function EventPageSkeleton() {
  return (
    <div className="pb-8">
      <div className="px-5 pt-8 text-center">
        <Skeleton className="mx-auto h-4 w-48" />
        <Skeleton className="mx-auto mt-4 h-24 w-full max-w-[280px]" />
        <div className="mt-8 space-y-5">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <Skeleton className="mt-8 h-12 w-full rounded-xl" />
      </div>
      <div className="mt-10 bg-[#f8f8f8] px-5 py-10">
        <Skeleton className="mx-auto h-14 w-full max-w-[300px]" />
        <div className="mt-8 grid grid-cols-2 gap-2">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        </div>
      </div>
      <div className="px-5 pt-10">
        <Skeleton className="mx-auto h-16 w-full max-w-[280px]" />
        <Skeleton className="mt-6 h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}
