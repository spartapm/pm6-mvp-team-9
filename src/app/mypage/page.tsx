"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useApp } from "@/context/AppContext";

type MyPageTab = "profile" | "shopping";

type MenuItem = {
  label: string;
  href?: string;
  count?: number;
  isNew?: boolean;
};

type OrderStatus = {
  label: string;
  count: number;
  dot?: boolean;
};

const ORDER_STATUS: OrderStatus[] = [
  { label: "입금대기", count: 0 },
  { label: "결제완료", count: 0 },
  { label: "배송준비", count: 0 },
  { label: "배송중", count: 0 },
  { label: "배송완료", count: 0 },
  { label: "리뷰", count: 47, dot: true },
];

const SHOPPING_MENU: MenuItem[] = [
  { label: "주문배송내역 조회" },
  { label: "최근 본 상품" },
  { label: "상품 스크랩북", count: 15 },
  { label: "패키지할인", isNew: true },
  { label: "할인 중인 스크랩 상품" },
  { label: "나의 리뷰" },
  { label: "나의 문의내역", count: 2 },
  { label: "시공/생활 상담내역" },
  { label: "오!공간상담 신청내역", href: "/mypage/consultations" },
  { label: "AI 분석 리포트" },
];

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M11 3a5 5 0 0 1 5 5v3.2l1.2 2.4H4.8L6 11.2V8a5 5 0 0 1 5-5Z"
        stroke="#111"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9 17.5a2 2 0 0 0 4 0" stroke="#111" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="2.5" stroke="#111" strokeWidth="1.4" />
      <path
        d="M11 2.5v2M11 17.5v2M4.2 4.2l1.4 1.4M16.4 16.4l1.4 1.4M2.5 11h2M17.5 11h2M4.2 17.8l1.4-1.4M16.4 5.6l1.4-1.4"
        stroke="#111"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M3 3h2.2l1.4 9.2h10.8l1.6-6.8H6.2"
        stroke="#111"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="17.5" r="1.2" fill="#111" />
      <circle cx="15.5" cy="17.5" r="1.2" fill="#111" />
    </svg>
  );
}

function MenuRow({
  item,
  onUnavailable,
}: {
  item: MenuItem;
  onUnavailable: () => void;
}) {
  const content = (
    <>
      <span className="flex items-center gap-1.5 text-[15px] text-[#111]">
        {item.label}
        {item.count != null && (
          <span className="text-sm font-semibold text-[#01a1ff]">{item.count}</span>
        )}
        {item.isNew && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5252] text-[10px] font-bold text-white">
            N
          </span>
        )}
      </span>
      <span className="text-sm text-[#bbb]">&gt;</span>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-4 last:border-0"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onUnavailable}
      className="flex w-full items-center justify-between border-b border-[#f0f0f0] px-4 py-4 text-left last:border-0"
    >
      {content}
    </button>
  );
}

export default function MyPage() {
  const { cart, buyerConsultations, showToast } = useApp();
  const [tab, setTab] = useState<MyPageTab>("shopping");

  const cartCount = cart.length || 2;

  const handleMenuClick = () => showToast("준비 중인 기능이에요");

  return (
    <div className="min-h-full bg-white pb-nav">
      <div className="sticky top-0 z-20 bg-white">
        <div className="flex items-start justify-between px-4 pb-2 pt-3">
          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => setTab("profile")}
              className={`pb-2 text-[17px] ${
                tab === "profile"
                  ? "border-b-2 border-[#111] font-bold text-[#111]"
                  : "font-medium text-[#999]"
              }`}
            >
              프로필
            </button>
            <button
              type="button"
              onClick={() => setTab("shopping")}
              className={`pb-2 text-[17px] ${
                tab === "shopping"
                  ? "border-b-2 border-[#111] font-bold text-[#111]"
                  : "font-medium text-[#999]"
              }`}
            >
              쇼핑
            </button>
          </div>

          <div className="flex items-center gap-3 pt-0.5">
            <button type="button" onClick={handleMenuClick} aria-label="알림">
              <BellIcon />
            </button>
            <button type="button" onClick={handleMenuClick} aria-label="설정">
              <SettingsIcon />
            </button>
            <Link href="/cart" className="relative" aria-label="장바구니">
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5252] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {tab === "shopping" ? (
        <>
          <div className="flex items-center border-b border-[#f0f0f0] px-1 py-4">
            {ORDER_STATUS.map((status, index) => (
              <Fragment key={status.label}>
                <button
                  type="button"
                  onClick={handleMenuClick}
                  className="flex min-w-0 flex-1 flex-col items-center"
                >
                  <span className="relative text-center text-[11px] leading-4 text-[#666]">
                    {status.dot && (
                      <span className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full bg-[#ff5252]" />
                    )}
                    {status.label}
                  </span>
                  <span className="mt-1 text-sm font-semibold text-[#01a1ff]">
                    {status.count}
                  </span>
                </button>
                {index < ORDER_STATUS.length - 1 && (
                  <span className="shrink-0 px-0.5 text-[10px] text-[#ddd]">&gt;</span>
                )}
              </Fragment>
            ))}
          </div>

          <div className="bg-white">
            {SHOPPING_MENU.map((item) => (
              <MenuRow key={item.label} item={item} onUnavailable={handleMenuClick} />
            ))}
          </div>

          <button
            type="button"
            onClick={handleMenuClick}
            className="fixed bottom-[calc(var(--nav-height)+var(--safe-area-bottom)+12px)] right-[max(1rem,calc(50%-195px+1rem))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#01a1ff] text-3xl font-light text-white shadow-lg"
            aria-label="추가"
          >
            +
          </button>
        </>
      ) : (
        <div className="px-4 pt-4">
          <div className="overflow-hidden rounded-xl bg-white">
            <Link
              href="/mypage/consultations"
              className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-4"
            >
              <span className="flex items-center gap-1.5 text-[15px] text-[#111]">
                오!공간상담 신청내역
                {buyerConsultations.length > 0 && (
                  <span className="text-sm font-semibold text-[#01a1ff]">
                    {buyerConsultations.length}
                  </span>
                )}
              </span>
              <span className="text-sm text-[#bbb]">&gt;</span>
            </Link>
            <Link
              href="/creator/consultations"
              className="flex items-center justify-between px-4 py-4"
            >
              <span className="text-[15px] text-[#111]">오!공간상담 상담내역</span>
              <span className="text-sm text-[#bbb]">&gt;</span>
            </Link>
          </div>
        </div>
      )}

      <BottomNav activeOverride="/mypage" />
    </div>
  );
}
