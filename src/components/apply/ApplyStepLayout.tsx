"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import ApplyExitModal from "@/components/apply/ApplyExitModal";
import ProgressBar from "@/components/ui/ProgressBar";
import { useCancelOnBack } from "@/hooks/use-cancel-on-back";
import { APPLY_STEPS } from "@/lib/constants";

type ApplyStepLayoutProps = {
  stepIndex: number;
  title: string;
  subtitle?: string;
  error?: string;
  children: ReactNode;
  nextLabel?: string;
  onNext: () => void;
  nextDisabled?: boolean;
  backHref?: string;
  showCancelModal?: boolean;
};

export default function ApplyStepLayout({
  stepIndex,
  title,
  subtitle,
  error,
  children,
  nextLabel = "다음",
  onNext,
  nextDisabled = false,
  backHref,
  showCancelModal = true,
}: ApplyStepLayoutProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const openCancelModal = useCallback(() => setShowModal(true), []);

  useCancelOnBack(showCancelModal, openCancelModal);

  const handleHeaderBack = () => {
    if (showCancelModal) {
      setShowModal(true);
      return;
    }
    exitApply();
  };

  const handleFooterBack = () => {
    if (stepIndex > 0) {
      router.push(`/apply/step/${stepIndex - 1}`);
      return;
    }
    if (showCancelModal) {
      setShowModal(true);
      return;
    }
    exitApply();
  };

  const exitApply = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };

  return (
    <div className="flex min-h-full flex-col bg-white pb-24">
      <ProgressBar current={stepIndex + 1} total={APPLY_STEPS.length} />
      <div className="flex h-11 items-center px-4">
        <button type="button" onClick={handleHeaderBack} className="text-xl" aria-label="뒤로가기">
          ←
        </button>
      </div>
      <div className="flex-1 px-6 pt-2">
        <h1 className={`text-lg font-medium leading-7 ${error ? "text-[#e03131]" : "text-black"}`}>
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-[#666]">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {error && (
          <p className="mt-2 flex items-center gap-1 text-sm text-[#e03131]">
            ⚠ {error}
          </p>
        )}
      </div>
      <div className="mobile-fixed bottom-0 border-t border-[#eee] bg-white px-safe py-3 mobile-cta-bar">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFooterBack}
            className="h-12 flex-1 rounded-xl border border-[#ddd] text-sm font-medium"
          >
            뒤로
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="h-12 flex-[2] rounded-xl bg-[#01a1ff] text-sm font-semibold text-white disabled:bg-[#ccc] disabled:text-white"
          >
            {nextLabel}
          </button>
        </div>
      </div>
      <ApplyExitModal
        open={showModal}
        onContinue={() => setShowModal(false)}
        onCancel={exitApply}
      />
    </div>
  );
}
