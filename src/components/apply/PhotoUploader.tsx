"use client";

import { useApp } from "@/context/AppContext";

const UPLOAD_COMING_SOON_MESSAGE = "이미지 업로드 서비스 준비중입니다";

type PhotoUploaderProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  previewPhotos?: readonly string[];
  max?: number;
  hasError?: boolean;
  variant?: "default" | "camera";
  thumbSize?: number;
  addButtonFirst?: boolean;
  onAddClick?: () => void;
};

export default function PhotoUploader({
  photos,
  onChange,
  previewPhotos = [],
  max = 10,
  hasError = false,
  variant = "default",
  thumbSize = 100,
  addButtonFirst = false,
  onAddClick,
}: PhotoUploaderProps) {
  const { showToast } = useApp();
  const totalCount = previewPhotos.length + photos.length;

  const handleAddClick = () => {
    if (totalCount >= max) {
      showToast(`최대 ${max}장까지 업로드할 수 있어요`);
      return;
    }
    if (onAddClick) {
      onAddClick();
      return;
    }
    showToast(UPLOAD_COMING_SOON_MESSAGE);
  };

  const addButton =
    totalCount < max ? (
      <button
        type="button"
        onClick={handleAddClick}
        style={{ width: thumbSize, height: thumbSize }}
        className={`flex shrink-0 flex-col items-center justify-center rounded-lg ${
          variant === "camera"
            ? "border border-[#e0e0e0] bg-[#f5f5f5] text-[#bbb]"
            : "border border-dashed border-[#ccc] bg-[#fafafa] text-sm text-[#999]"
        }`}
      >
        {variant === "camera" ? (
          <span className="text-2xl leading-none" aria-hidden>
            📷
          </span>
        ) : (
          "+"
        )}
      </button>
    ) : null;

  const previewThumbs = previewPhotos.map((photo, i) => (
    <div
      key={`preview-${i}`}
      className="relative shrink-0"
      style={{ width: thumbSize, height: thumbSize }}
    >
      <img src={photo} alt="" className="h-full w-full rounded-lg object-cover" />
    </div>
  ));

  const thumbs = photos.map((photo, i) => (
    <div
      key={`photo-${i}`}
      className="relative shrink-0"
      style={{ width: thumbSize, height: thumbSize }}
    >
      <img src={photo} alt="" className="h-full w-full rounded-lg object-cover" />
      <button
        type="button"
        onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
      >
        ✕
      </button>
    </div>
  ));

  return (
    <div
      className={`flex flex-wrap gap-2 rounded-lg p-1 ${hasError ? "ring-2 ring-[#e03131]" : ""}`}
    >
      {addButtonFirst ? (
        <>
          {addButton}
          {previewThumbs}
          {thumbs}
        </>
      ) : (
        <>
          {previewThumbs}
          {thumbs}
          {addButton}
        </>
      )}
    </div>
  );
}
