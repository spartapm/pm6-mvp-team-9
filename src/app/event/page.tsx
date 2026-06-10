"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import EventPageSkeleton from "@/components/event/EventPageSkeleton";
import ErrorRetry from "@/components/ui/ErrorRetry";
import Skeleton from "@/components/ui/Skeleton";
import { fetchEventContent } from "@/lib/api/mock-fetch";
import { EVENT_MOCK, formatPrice } from "@/lib/mock-data";

const BENEFITS = [
  {
    icon: "📷",
    title: "내 공간 사진 기반 맞춤 상담",
    desc: "사진과 고민을 바탕으로 정확하게 진단해드려요.",
  },
  {
    icon: "🔧",
    title: "가구 조합 & 배치 가이드 제공",
    desc: "공간에 딱 맞는 가구 조합과 배치 팁을 알려드려요.",
  },
  {
    icon: "💰",
    title: "상품 추천 & 구매 링크 제공",
    desc: "추천 상품 정보와 구매 링크를 함께 드려요.",
  },
] as const;

export default function EventPage() {
  const [tab, setTab] = useState<"creators" | "event">("event");
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({ before: false, after: false });

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    fetchEventContent({ retry: retryCount > 0 })
      .then(() => {
        if (!cancelled) setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const showContent = loadState === "ready";

  return (
    <div className="min-h-full bg-white pb-nav">
      <PageHeader title="오!공간상담" border={false} />

      <div className="flex border-b border-[#eee]">
        <Link
          href="/creators"
          className={`flex-1 py-3 text-center text-[15px] font-semibold ${
            tab === "creators" ? "border-b-2 border-[#01a1ff] text-[#01a1ff]" : "text-black"
          }`}
        >
          크리에이터 목록
        </Link>
        <button
          type="button"
          onClick={() => setTab("event")}
          className={`flex-1 py-3 text-center text-[15px] font-semibold ${
            tab === "event" ? "border-b-2 border-[#01a1ff] text-[#01a1ff]" : "text-black"
          }`}
        >
          이벤트
        </button>
      </div>

      {loadState === "loading" && <EventPageSkeleton />}

      {loadState === "error" && (
        <ErrorRetry
          message="일시적인 오류가 발생했어요. 다시 시도해주세요."
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      )}

      {showContent && (
        <div className="pb-8">
          {/* Hero */}
          <section className="px-5 pt-8 text-center">
            <p className="text-sm text-[#999]">방을 꾸미는데 고민이 많으셨죠?</p>
            <h2 className="mt-4 text-[22px] font-bold leading-8 text-black">
              오늘의집에서 선정한
              <br />
              <span className="text-[#01a1ff]">스페셜 크리에이터</span>에게
              <br />
              상담을 받아보세요
            </h2>

            <ul className="mt-8 space-y-5 text-left">
              {BENEFITS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-lg">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[#999]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/creators"
              className="mt-8 block rounded-xl bg-[#01a1ff] py-3.5 text-center text-base font-semibold text-white"
            >
              상담 신청하기 &gt;
            </Link>
          </section>

          {/* Reviews */}
          <section className="mt-10 bg-[#f8f8f8] px-5 py-10 text-center">
            <h3 className="text-lg font-bold leading-7 text-black">
              다양한 크리에이터에 대한
              <br />
              유저들의 실제 후기를 확인해보세요
            </h3>
            <p className="mt-3 text-xs text-[#999]">2026년 6월 기준</p>

            <div className="mt-8">
              <p className="text-base font-bold text-black">상담 고객이 작성한 리얼 상담후기</p>
              <p className="mt-1 text-xs text-[#999]">
                크리에이터들의 상담을 통한 리얼 상담 후기들
              </p>
            </div>

            <p className="mt-8 text-sm font-bold text-black">이런 답변을 받을 수 있어요</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="relative overflow-hidden rounded-xl">
                {!imagesLoaded.before && (
                  <Skeleton className="absolute inset-0 aspect-[4/3] w-full rounded-xl" />
                )}
                <img
                  src={EVENT_MOCK.beforeImage}
                  alt="Before"
                  onLoad={() => setImagesLoaded((s) => ({ ...s, before: true }))}
                  className={`aspect-[4/3] w-full object-cover ${imagesLoaded.before ? "" : "opacity-0"}`}
                />
                <span className="absolute left-2 top-2 rounded bg-[#555] px-2 py-0.5 text-[11px] font-medium text-white">
                  Before
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl">
                {!imagesLoaded.after && (
                  <Skeleton className="absolute inset-0 aspect-[4/3] w-full rounded-xl" />
                )}
                <img
                  src={EVENT_MOCK.afterImage}
                  alt="After"
                  onLoad={() => setImagesLoaded((s) => ({ ...s, after: true }))}
                  className={`aspect-[4/3] w-full object-cover ${imagesLoaded.after ? "" : "opacity-0"}`}
                />
                <span className="absolute left-2 top-2 rounded bg-[#01a1ff] px-2 py-0.5 text-[11px] font-medium text-white">
                  After (예시)
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#999]">
              ※ 실제 답변은 크리에이터에 따라 다를 수 있습니다.
            </p>
          </section>

          {/* Estimate sample */}
          <section className="px-5 pt-10 text-center">
            <h3 className="text-lg font-bold leading-7 text-black">
              상담을 신청하면
              <br />
              <span className="text-[#01a1ff]">스페셜 크리에이터들</span>이
              <br />
              정성껏 견적서를 작성해드립니다
            </h3>
            <p className="mt-3 text-xs text-[#999]">실제 견적서 예시</p>

            <div className="mt-6 rounded-xl border border-[#b8dcff] bg-white p-4 text-left">
              <div className="flex items-start gap-3">
                <img
                  src={EVENT_MOCK.creatorAvatar}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-black">{EVENT_MOCK.creatorName}</p>
                  <p className="mt-0.5 text-xs text-[#666]">
                    🏠 {EVENT_MOCK.creatorSubtitle}
                  </p>
                </div>
                <span className="shrink-0 text-[#999]">⌃</span>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#333]">{EVENT_MOCK.comment}</p>

              <p className="mt-5 text-sm font-semibold text-black">추천 상품</p>
              <div className="mt-3 space-y-4">
                {EVENT_MOCK.products.map((p) => (
                  <div key={p.id} className="flex gap-3">
                    <img
                      src={p.image}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-black">{p.name}</p>
                      <p className="text-sm font-semibold text-[#01a1ff]">
                        {formatPrice(p.price)}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-[#666]">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-lg bg-[#e8f4ff] px-4 py-3">
                <span className="text-sm font-medium text-black">합계</span>
                <span className="text-base font-bold text-black">
                  {formatPrice(EVENT_MOCK.budgetTotal)}
                </span>
              </div>

              <button
                type="button"
                disabled
                className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#01a1ff]/40 bg-white py-3 text-sm font-medium text-[#01a1ff]/50"
              >
                <span>🧊</span>
                3D 배치도 보러가기
              </button>

              <p className="mt-4 text-sm leading-6 text-[#666]">
                <span className="font-semibold text-black">배치 팁</span>{" "}
                {EVENT_MOCK.placementTip}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#666]">
                <span className="font-semibold text-black">구매 전 주의점</span>{" "}
                {EVENT_MOCK.caution}
              </p>
            </div>
          </section>
        </div>
      )}

      <BottomNav activeOverride="/event" />
    </div>
  );
}
