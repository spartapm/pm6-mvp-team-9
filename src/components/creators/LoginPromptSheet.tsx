"use client";

import BottomSheet from "@/components/ui/BottomSheet";

type LoginPromptSheetProps = {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
};

export default function LoginPromptSheet({
  open,
  onClose,
  onLogin,
}: LoginPromptSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="로그인이 필요해요">
      <div className="px-6 pb-8">
        <p className="text-sm leading-6 text-[#666]">
          북마크는 로그인 후 이용할 수 있어요.
          <br />
          로그인하고 관심 크리에이터를 저장해보세요.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="mt-6 w-full rounded-xl bg-[#01a1ff] py-3 text-sm font-semibold text-white"
        >
          로그인하기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 text-sm text-[#666]"
        >
          닫기
        </button>
      </div>
    </BottomSheet>
  );
}
