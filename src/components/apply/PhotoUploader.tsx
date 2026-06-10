"use client";

import { useRef, useState } from "react";
import { useApp } from "@/context/AppContext";

const ACCEPT = "image/jpeg,image/jpg,image/png";

type PhotoUploaderProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
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
  max = 10,
  hasError = false,
  variant = "default",
  thumbSize = 100,
  addButtonFirst = false,
  onAddClick,
}: PhotoUploaderProps) {
  const { showToast } = useApp();
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const readFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = max - photos.length;
    const selected = Array.from(files).slice(0, remaining);

    for (const file of selected) {
      if (!ACCEPT.split(",").includes(file.type)) {
        showToast("JPG, JPEG, PNG 형식만 업로드 가능해요");
        continue;
      }
    }

    const valid = selected.filter((f) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(f.type),
    );
    if (valid.length === 0) return;

    setUploading(true);
    const urls = await Promise.all(
      valid.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
    onChange([...photos, ...urls].slice(0, max));
    setUploading(false);
  };

  const handleAddClick = () => {
    if (photos.length >= max) {
      showToast(`최대 ${max}장까지 업로드할 수 있어요`);
      return;
    }
    if (onAddClick) {
      onAddClick();
      return;
    }
    galleryRef.current?.click();
  };

  const addButton =
    photos.length < max ? (
      <button
        type="button"
        onClick={handleAddClick}
        disabled={uploading}
        style={{ width: thumbSize, height: thumbSize }}
        className={`flex shrink-0 flex-col items-center justify-center rounded-lg disabled:opacity-50 ${
          variant === "camera"
            ? "border border-[#e0e0e0] bg-[#f5f5f5] text-[#bbb]"
            : "border border-dashed border-[#ccc] bg-[#fafafa] text-sm text-[#999]"
        }`}
      >
        {uploading ? (
          <span className="text-xs text-[#999]">업로드 중…</span>
        ) : variant === "camera" ? (
          <span className="text-2xl leading-none" aria-hidden>
            📷
          </span>
        ) : (
          "+"
        )}
      </button>
    ) : null;

  const thumbs = photos.map((photo, i) => (
    <div
      key={i}
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
    <>
      <input
        ref={galleryRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          readFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className={`flex flex-wrap gap-2 rounded-lg p-1 ${hasError ? "ring-2 ring-[#e03131]" : ""}`}
      >
        {addButtonFirst ? (
          <>
            {addButton}
            {thumbs}
          </>
        ) : (
          <>
            {thumbs}
            {addButton}
          </>
        )}
      </div>
    </>
  );
}
