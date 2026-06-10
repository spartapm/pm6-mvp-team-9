"use client";

import { useApp } from "@/context/AppContext";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="mobile-fixed bottom-[calc(var(--nav-height)+var(--safe-area-bottom)+0.75rem)] z-[60] w-[min(340px,calc(100%-2rem))] rounded-lg bg-[#333]/90 px-4 py-3 text-center text-sm text-white shadow-lg">
      {toast.message}
    </div>
  );
}
