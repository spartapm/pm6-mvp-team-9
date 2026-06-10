type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-[#eee] via-[#f5f5f5] to-[#eee] ${className}`}
    />
  );
}
