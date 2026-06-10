"use client";

type ApplyExitModalProps = {
  open: boolean;
  onContinue: () => void;
  onCancel: () => void;
};

export default function ApplyExitModal({
  open,
  onContinue,
  onCancel,
}: ApplyExitModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onContinue}
        aria-label="닫기"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-exit-title"
        className="relative z-10 w-full max-w-[320px] rounded-lg bg-white px-6 py-5 shadow-xl"
      >
        <h2 id="apply-exit-title" className="text-base font-bold leading-6 text-[#111]">
          정말 신청을 안 하시나요?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#111]">
          중단 시 작성하신 내용이 저장되지 않습니다.
        </p>
        <div className="mt-6 flex justify-end gap-5">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-[#01a1ff]"
          >
            신청 취소
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="text-sm font-medium text-[#01a1ff]"
          >
            계속 작성
          </button>
        </div>
      </div>
    </div>
  );
}
