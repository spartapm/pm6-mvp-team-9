"use client";

type FullscreenImageViewerProps = {
  src: string | null;
  onClose: () => void;
};

export default function FullscreenImageViewer({ src, onClose }: FullscreenImageViewerProps) {
  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-xl text-white"
        aria-label="닫기"
      >
        ✕
      </button>
      <img src={src} alt="" className="max-h-full max-w-full object-contain" />
    </div>
  );
}
