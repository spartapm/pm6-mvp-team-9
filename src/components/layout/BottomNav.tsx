"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/browse", label: "집구경", icon: "😊" },
  { href: "/shop", label: "쇼핑", icon: "🛍️" },
  { href: "/event", label: "인테리어/생활", icon: "👷" },
  { href: "/mypage", label: "마이페이지", icon: "👤" },
] as const;

type BottomNavProps = {
  activeOverride?: string;
  activeStyle?: "blue" | "black";
};

export default function BottomNav({
  activeOverride,
  activeStyle = "blue",
}: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (activeOverride) return activeOverride === href;
    if (href === "/") return pathname === "/";
    if (href === "/event") return pathname.startsWith("/event") || pathname.startsWith("/creators");
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-fixed bottom-0 z-40 border-t border-[#e8e8e8] bg-white pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex h-14 items-center justify-around">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const clickable = tab.href === "/" || tab.href === "/mypage" || tab.href === "/event";
          const content = (
            <div className="flex flex-col items-center gap-0.5">
              <span className={`text-lg ${active ? "opacity-100" : "opacity-50"}`}>
                {tab.icon}
              </span>
              <span
                className={`text-[10px] ${
                  active
                    ? activeStyle === "black"
                      ? "font-semibold text-[#111]"
                      : "font-semibold text-[#01a1ff]"
                    : "text-[#666]"
                }`}
              >
                {tab.label}
              </span>
            </div>
          );

          if (!clickable) {
            return (
              <div key={tab.href} className="flex-1 text-center opacity-40">
                {content}
              </div>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 items-center justify-center py-1"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
