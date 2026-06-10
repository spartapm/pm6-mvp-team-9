"use client";

import Link from "next/link";
import { useState } from "react";
import type { Creator } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import LoginPromptSheet from "@/components/creators/LoginPromptSheet";

type CreatorCardProps = {
  creator: Creator;
};

function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 18 22"
      fill={active ? "#01a1ff" : "none"}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 1.5h12A1.5 1.5 0 0 1 16.5 3v17.4a.75.75 0 0 1-1.14.643L9 16.8l-6.36 3.243A.75.75 0 0 1 1.5 20.4V3A1.5 1.5 0 0 1 3 1.5Z"
        stroke={active ? "#01a1ff" : "#bdbdbd"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const { requestBookmark, login, toggleBookmark, showToast } = useApp();
  const [loginOpen, setLoginOpen] = useState(false);
  const isClosed = creator.capacity >= creator.maxCapacity;
  const remaining = creator.maxCapacity - creator.capacity;

  const handleClick = (e: React.MouseEvent) => {
    if (isClosed) {
      e.preventDefault();
      showToast("현재 신청이 마감되었습니다");
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = requestBookmark(creator.id);
    if (result === "login_required") {
      setLoginOpen(true);
    }
  };

  const handleLogin = () => {
    login();
    toggleBookmark(creator.id);
    setLoginOpen(false);
    showToast("북마크에 저장했어요");
  };

  return (
    <>
      <Link
        href={`/creators/${creator.id}`}
        onClick={handleClick}
        className="relative block border-b border-[#f0f0f0] px-4 py-4"
      >
        <div className={`flex gap-3 ${isClosed ? "opacity-40" : ""}`}>
          <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="pr-8 text-base font-bold text-black">{creator.name}</p>
            <p className="mt-0.5 truncate text-xs text-[#666]">{creator.bio}</p>
            <div className="mt-1.5 flex items-center gap-1 text-xs">
              <span className="text-[#01a1ff]">★</span>
              <span className="font-medium text-[#333]">{creator.rating.toFixed(1)}</span>
              <span className="text-[#999]">({creator.reviewCount})</span>
              <span className="text-[#999]">상담 {creator.consultCount}건</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {creator.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[11px] text-[#555]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-8 shrink-0 flex-col items-end justify-between self-stretch">
            <button
              type="button"
              onClick={handleBookmark}
              className="p-0.5"
              aria-label="북마크"
            >
              <BookmarkIcon active={!!creator.bookmarked} />
            </button>
            <span className="text-xs font-bold text-[#999]">
              {remaining}/{creator.maxCapacity}
            </span>
          </div>
        </div>

        {isClosed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-xl font-bold text-white">마감</span>
          </div>
        )}
      </Link>

      <LoginPromptSheet
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
}
