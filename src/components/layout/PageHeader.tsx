"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  showBack?: boolean;
  backIcon?: "back" | "close";
  border?: boolean;
};

export default function PageHeader({
  title,
  onBack,
  right,
  showBack = true,
  backIcon = "back",
  border = true,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={`sticky top-0 z-30 flex h-12 min-w-0 items-center justify-between bg-white px-safe ${border ? "border-b border-[#eee]" : ""}`}
    >
      <div className="flex min-w-[40px] items-center">
        {showBack && (
          <button
            type="button"
            onClick={onBack ?? (() => router.back())}
            className="text-xl leading-none text-black"
            aria-label={backIcon === "close" ? "닫기" : "뒤로가기"}
          >
            {backIcon === "close" ? "✕" : "←"}
          </button>
        )}
      </div>
      {title && (
        <h1 className="absolute left-1/2 max-w-[calc(100%-6rem)] -translate-x-1/2 truncate text-center text-[15px] font-semibold text-black">
          {title}
        </h1>
      )}
      <div className="flex min-w-[40px] items-center justify-end">{right}</div>
    </header>
  );
}
