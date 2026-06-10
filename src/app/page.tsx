"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Skeleton from "@/components/ui/Skeleton";
import ErrorRetry from "@/components/ui/ErrorRetry";
import { fetchHomeContent } from "@/lib/api/mock-fetch";

const HOME_POST_IMAGE = "/images/home-post-content.png";

function HomeSkeleton() {
  return <Skeleton className="aspect-[402/819] w-full rounded-none" />;
}

export default function HomePage() {
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [retryCount, setRetryCount] = useState(0);

  const loadContent = useCallback(async () => {
    setLoadState("loading");
    try {
      await fetchHomeContent({ retry: retryCount > 0 });
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [retryCount]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return (
    <div className="relative min-h-full bg-white pb-[calc(5.125rem+env(safe-area-inset-bottom,0px))]">
      {loadState === "loading" && <HomeSkeleton />}

      {loadState === "error" && (
        <ErrorRetry
          message="일시적인 오류가 발생했어요. 다시 시도해주세요."
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      )}

      {loadState === "ready" && (
        <img
          src={HOME_POST_IMAGE}
          alt="크리에이터 콘텐츠"
          className="block w-full"
        />
      )}

      {loadState === "ready" && (
        <div className="mobile-fixed bottom-0 pb-[env(safe-area-inset-bottom,0px)]">
          <div className="flex items-center justify-between gap-3 rounded-t-[10px] border border-[#d8d8d8] bg-white px-4 py-4 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] min-[360px]:px-[30px]">
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium leading-snug text-[#01a1ff]">
                이 공간처럼 꾸미고 싶다면?
              </p>
              <p className="mt-1 text-xs leading-snug text-black">
                전문가가 공간에 맞게 추천해드려요
              </p>
            </div>
            <Link
              href="/event"
              className="flex h-[41px] shrink-0 items-center justify-center rounded-[10px] bg-[#01a1ff] px-5 text-[15px] text-white"
            >
              추천받기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
