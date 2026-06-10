import Link from "next/link";

export default function ConsultationTopBar() {
  return (
    <div className="flex min-w-0 items-center gap-2 border-b border-[#f0f0f0] bg-white px-safe py-2">
      <button type="button" className="shrink-0 text-xl text-[#111]" aria-label="메뉴">
        ☰
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f5f5f5] px-3 py-2">
        <span className="text-sm text-[#999]">🔍</span>
        <span className="truncate text-sm text-[#999]">오늘 11시 빙그레 오늘의집 라이브</span>
      </div>
      <div className="flex shrink-0 items-center gap-2.5 text-lg">
        <button type="button" aria-label="알림">
          🔔
        </button>
        <button type="button" aria-label="북마크">
          🔖
        </button>
        <Link href="/cart" aria-label="장바구니">
          🛒
        </Link>
      </div>
    </div>
  );
}
