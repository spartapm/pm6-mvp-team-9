"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import CreatorDetailSkeleton from "@/components/creators/CreatorDetailSkeleton";
import LoginPromptSheet from "@/components/creators/LoginPromptSheet";
import ErrorRetry from "@/components/ui/ErrorRetry";
import { useApp } from "@/context/AppContext";
import { fetchCreatorDetail } from "@/lib/api/mock-fetch";

function VerifiedBadge() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 1.5 10.8 6.2l5 .4-3.8 3.3 1.2 4.9L9 12.8 4.8 14.8l1.2-4.9L2.2 6.6l5-.4L9 1.5Z"
        fill="#34C759"
      />
      <path
        d="m7.1 9.2 1.2 1.2 2.8-2.8"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M9.8 1.8 12.2 4.2 4.6 11.8H2.2V9.4L9.8 1.8Z"
        stroke="#666"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M8.4 3.2 10.8 5.6" stroke="#666" strokeWidth="1.2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M5.5 8.5 10 4M10 4H6.5M10 4V7.5"
        stroke="#666"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4.5H3A1.5 1.5 0 0 0 1.5 6v6A1.5 1.5 0 0 0 3 13.5h6A1.5 1.5 0 0 0 10.5 12V11"
        stroke="#666"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <span className="text-[#ffb400]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < count ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

function MoreMenuIcon() {
  return (
    <svg width="18" height="4" viewBox="0 0 18 4" fill="none" aria-hidden>
      <circle cx="2" cy="2" r="1.5" fill="#111" />
      <circle cx="9" cy="2" r="1.5" fill="#111" />
      <circle cx="16" cy="2" r="1.5" fill="#111" />
    </svg>
  );
}

export default function CreatorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { creators, requestBookmark, login, toggleBookmark, showToast } = useApp();
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<"content" | "scrap">("content");
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  const mockReviews = [
    {
      rating: 5,
      text: "자세한 리뷰 내용이 여기에 표시됩니다.\n정말 만족스러워요!",
      date: "20xx.xx.xx",
    },
    {
      rating: 5,
      text: "공간 활용 팁이 특히 도움이 됐어요. 추천 상품도 만족합니다.",
      date: "2026.04.18",
    },
    {
      rating: 4,
      text: "답변이 빠르고 친절했어요. 다음에도 상담받고 싶습니다.",
      date: "2026.03.22",
    },
  ];

  const creator = creators.find((c) => c.id === id);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    fetchCreatorDetail({ retry: retryCount > 0 })
      .then(() => {
        if (!cancelled) setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  if (loadState === "loading") {
    return (
      <div className="min-h-full bg-white pb-24">
        <PageHeader
          right={
            <button type="button" aria-label="더보기">
              <MoreMenuIcon />
            </button>
          }
          border={false}
        />
        <CreatorDetailSkeleton />
      </div>
    );
  }

  if (loadState === "error" && !creator) {
    return (
      <div className="min-h-full bg-white">
        <PageHeader border={false} />
        <ErrorRetry
          message="일시적인 오류가 발생했어요. 다시 시도해주세요."
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p>크리에이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isClosed = creator.capacity >= creator.maxCapacity;

  const handleBookmark = () => {
    const result = requestBookmark(creator.id);
    if (result === "login_required") setLoginOpen(true);
  };

  const handleLogin = () => {
    login();
    toggleBookmark(creator.id);
    setLoginOpen(false);
    showToast("북마크에 저장했어요");
  };

  return (
    <div className="min-h-full bg-white pb-24">
      {loadState === "error" && (
        <div className="mx-4 mt-2 rounded-xl bg-[#fff5f5] px-4 py-3">
          <p className="text-sm text-[#666]">일시적인 오류가 발생했어요.</p>
          <button
            type="button"
            onClick={() => setRetryCount((c) => c + 1)}
            className="mt-1 text-sm font-semibold text-[#01a1ff]"
          >
            새로고침
          </button>
        </div>
      )}

      <PageHeader
        right={
          <button type="button" aria-label="더보기">
            <MoreMenuIcon />
          </button>
        }
        border={false}
      />

      <div className="px-4 pb-4 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h1 className="truncate text-[22px] font-bold leading-7 text-[#111]">
                {creator.name}
              </h1>
              {creator.isSpecial && <VerifiedBadge />}
            </div>
            <p className="mt-0.5 text-[15px] font-semibold text-[#95969c]">
              팔로워 {creator.followers}
            </p>
          </div>
          <img
            src={creator.avatar}
            alt=""
            className="h-[70px] w-[70px] shrink-0 rounded-full object-cover"
          />
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#95969c]">{creator.bio}</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setFollowing(!following)}
            className="h-[30px] min-w-0 flex-1 rounded-[10px] bg-[#01a1ff] text-sm font-semibold text-white"
          >
            {following ? "팔로잉" : "팔로우"}
          </button>
          <button
            type="button"
            onClick={handleBookmark}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] border border-[#c8c8c8] bg-white"
            aria-label="북마크"
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            onClick={() => showToast("프로필 링크가 복사되었습니다")}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] border border-[#c8c8c8] bg-white"
            aria-label="공유"
          >
            <ShareIcon />
          </button>
        </div>

        <div className="mt-4 flex rounded-[10px] bg-[#f5f5f5] py-3">
          {[
            {
              label: "평점",
              value: (
                <span className="inline-flex items-center justify-center gap-0.5">
                  <span className="text-[#ffb400]">★</span>
                  <span>{creator.rating}</span>
                </span>
              ),
            },
            { label: "리뷰", value: `${creator.reviewCount}개` },
            { label: "상담", value: `${creator.consultCount}건` },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 text-center ${i > 0 ? "border-l border-[#ddd]" : ""}`}
            >
              <p className="text-xs font-bold text-[#111]">{stat.label}</p>
              <p className="mt-1 text-base font-normal text-[#111]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex max-h-[62px] flex-wrap gap-2 overflow-hidden">
          {creator.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#f4f4f5] px-3 py-1 text-[13px] leading-[19px] text-[#8c8b91]"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#111]">대표 콘텐츠</h2>
            <span className="cursor-not-allowed text-[13px] text-[#8c8b91]">
              전체보기 &gt;
            </span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {creator.portfolio.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="h-[87px] w-[100px] shrink-0 rounded-[5px] object-cover"
              />
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#111]">
              리뷰 ({creator.reviewCount})
            </h2>
            <span className="cursor-not-allowed text-[13px] text-[#8c8b91]">
              전체보기 &gt;
            </span>
          </div>
          <div className="mt-3 rounded-[10px] bg-[#f5f5f5] p-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 shrink-0 rounded-full bg-[#ddd]" />
              <StarRating count={mockReviews[0].rating} />
            </div>
            <p className="mt-2 whitespace-pre-line text-[13px] leading-5 text-[#333]">
              {mockReviews[0].text}
            </p>
            <p className="mt-2 text-[13px] text-[#999]">{mockReviews[0].date}</p>
          </div>
        </section>

        <div className="mt-6">
          <div className="flex border-b border-[#eee]">
            <button
              type="button"
              onClick={() => setTab("content")}
              className={`flex-1 pb-2.5 text-[15px] font-bold ${
                tab === "content"
                  ? "border-b-2 border-black text-black"
                  : "text-[#a0a0a0]"
              }`}
            >
              콘텐츠
            </button>
            <button
              type="button"
              onClick={() => setTab("scrap")}
              className={`flex-1 pb-2.5 text-[15px] font-bold ${
                tab === "scrap"
                  ? "border-b-2 border-black text-black"
                  : "text-[#a0a0a0]"
              }`}
            >
              스크랩
            </button>
          </div>

          {tab === "content" ? (
            <div className="mt-0.5 grid grid-cols-3 gap-0.5">
              {creator.contentGrid.map((img, i) => (
                <img key={i} src={img} alt="" className="aspect-square object-cover" />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-[#999]">
              스크랩한 콘텐츠가 없어요
            </div>
          )}
        </div>
      </div>

      <div className="mobile-fixed bottom-0 bg-white px-safe pb-[max(var(--safe-area-bottom),8px)] pt-2">
        {isClosed ? (
          <button
            type="button"
            onClick={() => showToast("현재 신청이 마감되었습니다")}
            className="w-full rounded-[15px] bg-[#ccc] py-3.5 text-base font-bold text-white"
          >
            마감
          </button>
        ) : (
          <Link
            href={`/apply/step/0?creatorId=${creator.id}`}
            onClick={() => {
              sessionStorage.setItem("applyCreatorId", creator.id);
              sessionStorage.setItem("applyCreatorName", creator.name);
              sessionStorage.setItem("applyCreatorAvatar", creator.avatar);
            }}
            className="block w-full rounded-[15px] bg-[#01a1ff] py-3.5 text-center text-base font-bold text-white"
          >
            상담 신청하기
          </Link>
        )}
      </div>

      <LoginPromptSheet
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
