"use client";

import { useEffect } from "react";

/** 브라우저/물리적 뒤로가기 시 취소 확인 모달을 띄우기 위한 훅 */
export function useCancelOnBack(enabled: boolean, onBackAttempt: () => void) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    window.history.pushState({ cancelGuard: true }, "");

    const handlePopState = () => {
      window.history.pushState({ cancelGuard: true }, "");
      onBackAttempt();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [enabled, onBackAttempt]);
}
