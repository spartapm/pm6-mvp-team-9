"use client";

import Link from "next/link";
import { useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useApp } from "@/context/AppContext";

export default function ApplyCompletePage() {
  const { buyerName, clearApplyForm } = useApp();

  useEffect(() => {
    clearApplyForm();
  }, [clearApplyForm]);

  return (
    <div className="flex min-h-full flex-col bg-white">
      <PageHeader title="신청 완료" />

      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-32 pt-16">
        <div className="flex h-[130px] w-[139px] items-center justify-center rounded-2xl bg-[#01a1ff]/10 text-5xl">
          🏠
        </div>
        <p className="mt-8 text-center text-lg font-medium leading-7">
          오직 {buyerName}님만을 위한
          <br />
          오!공간상담 곧 준비해드리겠습니다
        </p>
      </div>

      <div className="mobile-fixed bottom-0 border-t border-[#eee] bg-white px-safe py-3 mobile-cta-bar">
        <div className="flex gap-2">
          <Link
            href="/mypage/consultations"
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#ddd] text-sm font-medium"
          >
            닫기
          </Link>
          <Link
            href="/creators"
            className="flex h-12 flex-[2] items-center justify-center rounded-xl bg-[#01a1ff] text-sm font-semibold text-white"
          >
            더 많은 견적 받기
          </Link>
        </div>
      </div>
    </div>
  );
}
