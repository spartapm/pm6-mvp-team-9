"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/layout/PageHeader";

function ReviewCompleteContent() {
  const searchParams = useSearchParams();
  const points = Number(searchParams.get("points") ?? 0);

  return (
    <div className="flex min-h-full flex-col bg-white">
      <PageHeader title="리뷰 등록 완료" showBack={false} />

      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-32 pt-16">
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#01a1ff]/10 text-5xl">
          ★
        </div>
        <p className="mt-8 text-center text-lg font-semibold leading-7 text-[#111]">
          리뷰가 등록되었어요
        </p>
        {points > 0 && (
          <p className="mt-2 text-center text-sm text-[#666]">
            <span className="font-semibold text-[#01a1ff]">{points}P</span>가 적립될 예정이에요
          </p>
        )}
        <p className="mt-3 text-center text-sm leading-6 text-[#999]">
          소중한 후기가 다른 분들에게
          <br />
          큰 도움이 될 거예요
        </p>
      </div>

      <div className="mobile-fixed bottom-0 border-t border-[#eee] bg-white px-safe py-3 mobile-cta-bar">
        <Link
          href="/mypage/consultations?tab=done"
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#01a1ff] text-sm font-semibold text-white"
        >
          신청내역으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function ReviewCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-col bg-white">
          <PageHeader title="리뷰 등록 완료" showBack={false} />
        </div>
      }
    >
      <ReviewCompleteContent />
    </Suspense>
  );
}
