"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useCallback, useRef, useState } from "react";
import PhotoUploader from "@/components/apply/PhotoUploader";
import PageHeader from "@/components/layout/PageHeader";
import BottomSheet from "@/components/ui/BottomSheet";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { useCancelOnBack } from "@/hooks/use-cancel-on-back";
import {
  REVIEW_CREATOR_USAGE_TEXT,
  REVIEW_POLICY_DISCLAIMER,
  REVIEW_POLICY_TEXT,
} from "@/lib/constants";
import { getCreator } from "@/lib/mock-data";
import { getMobileScrollContainer } from "@/lib/mobile-scroll";

type PageProps = { params: Promise<{ id: string }> };

const LIST_PATH = "/mypage/consultations?tab=done";
const ACCEPT = "image/jpeg,image/jpg,image/png";

const REVIEW_ITEMS = [
  {
    id: "answer",
    category: "답변",
    positive: "👍 답변이 상세했어요",
    negative: "👎 답변이 짧았어요",
    required: true,
  },
  {
    id: "products",
    category: "추천 상품",
    positive: "👍 취향에 맞았어요",
    negative: "👎 취향에 안 맞았어요",
    required: true,
  },
  {
    id: "speed",
    category: "응답 속도",
    positive: "👍 응답이 빨랐어요",
    negative: "👎 응답이 느렸어요",
    required: true,
  },
  {
    id: "retry",
    category: "재상담 의향",
    positive: "👍 또 이용하고 싶어요",
    negative: "👎 다시 이용 안 할 것 같아요",
    required: false,
  },
] as const;

function PointLabel({ earned }: { earned: boolean }) {
  return (
    <span className={`text-xs ${earned ? "font-medium text-[#01a1ff]" : "text-[#bbb]"}`}>
      {earned ? "✓ " : ""}300P
    </span>
  );
}

function ReviewPageContent({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { consultations, submitReview, showToast } = useApp();
  const initialStars = Number(searchParams.get("stars") ?? 0);
  const satisfaction = (searchParams.get("satisfaction") ?? "positive") as
    | "positive"
    | "negative";

  const consultation = consultations.find((c) => c.id === id);
  const creator = consultation ? getCreator(consultation.creatorId) : null;

  const [stars, setStars] = useState(initialStars);
  const [selections, setSelections] = useState<
    Record<string, "positive" | "negative" | null>
  >({});
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [creatorUsageAgreed, setCreatorUsageAgreed] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [highlightItems, setHighlightItems] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const hasDraft =
    stars > 0 ||
    text.length > 0 ||
    photos.length > 0 ||
    !!video ||
    Object.values(selections).some(Boolean) ||
    policyAgreed ||
    creatorUsageAgreed;

  const goToList = useCallback(() => {
    router.push(LIST_PATH);
  }, [router]);

  useCancelOnBack(
    hasDraft,
    useCallback(() => setShowExit(true), []),
  );

  if (!consultation) {
    return <div className="p-6">리뷰 대상 정보를 불러오지 못했어요</div>;
  }

  const serviceLabel = `${consultation.requestForm.spaceType} 인테리어 견적 상담`;
  const requiredDone = REVIEW_ITEMS.filter((i) => i.required).every(
    (i) => selections[i.id],
  );
  const canSubmit =
    stars >= 1 && requiredDone && policyAgreed && text.length >= 20;

  const hasMedia = photos.length > 0 || !!video;
  const photoPoints = hasMedia ? 300 : 0;
  const textPoints = text.length >= 80 ? 300 : 0;
  const totalPoints = photoPoints + textPoints;

  const handleChoice = (itemId: string, value: "positive" | "negative") => {
    const current = selections[itemId] ?? null;
    if (current === value) {
      setSelections((prev) => ({ ...prev, [itemId]: null }));
      return;
    }
    if (current != null) return;

    setHighlightItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setSelections((prev) => ({ ...prev, [itemId]: value }));
  };

  const scrollToItem = (itemId: string) => {
    const el = itemRefs.current[itemId];
    if (!el) return;
    const container = getMobileScrollContainer();
    if (container) {
      const top = el.offsetTop - container.offsetTop - 80;
      container.scrollTo({ top, behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const readPhotoFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = 10 - photos.length;
    const selected = Array.from(files).slice(0, remaining);
    const valid = selected.filter((f) => ACCEPT.split(",").includes(f.type));

    if (valid.length === 0) {
      showToast("JPG, JPEG, PNG 형식만 업로드 가능해요");
      return;
    }

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
    setPhotos((prev) => [...prev, ...urls].slice(0, 10));
  };

  const handleVideoPick = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      showToast("동영상 파일만 업로드할 수 있어요");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setVideo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (stars < 1) {
      showToast("별점을 선택해주세요");
      return;
    }

    const missing = REVIEW_ITEMS.filter((i) => i.required && !selections[i.id]).map(
      (i) => i.id,
    );
    if (missing.length) {
      setHighlightItems(new Set(missing));
      scrollToItem(missing[0]);
      showToast("선택하지 않은 항목이 있어요");
      return;
    }

    if (text.length < 20) {
      showToast("후기는 최소 20자 이상 작성해주세요");
      return;
    }

    if (!policyAgreed) {
      showToast("리뷰 정책에 동의해주세요");
      return;
    }

    setSubmitting(true);
    submitReview(id, {
      score: stars,
      satisfaction,
      comment: text,
      photos,
      video: video ?? undefined,
      creatorUsageAgreed,
    });
    router.push(`/mypage/consultations/review/complete?points=${totalPoints}`);
  };

  const handleClose = () => {
    if (hasDraft) setShowExit(true);
    else goToList();
  };

  return (
    <div className="min-h-full bg-white pb-36">
      <PageHeader title="리뷰 남기기" backIcon="close" onBack={handleClose} />

      <div className="px-4 pt-5">
        <div className="flex items-center gap-3">
          <img
            src={creator?.avatar ?? consultation.creatorAvatar}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#111]">
              {consultation.creatorName}
            </p>
            <p className="mt-0.5 text-xs text-[#666]">{serviceLabel}</p>
            <span className="mt-1.5 inline-block rounded bg-[#f0f0f0] px-2 py-0.5 text-[11px] text-[#666]">
              최대 600P
            </span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[15px] font-bold text-[#111]">
            상담에 대한 만족도를 평가해주세요!
          </p>
          <div className="mt-4 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                className={`text-[32px] leading-none ${
                  n <= stars ? "text-[#01a1ff]" : "text-[#ddd]"
                }`}
                aria-label={`${n}점`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#999]">각 항목에서 하나씩 선택해주세요</p>
        </div>

        <div className="mt-8 space-y-5">
          {REVIEW_ITEMS.map((item) => {
            const selected = selections[item.id] ?? null;
            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                className={`rounded-xl p-0.5 ${
                  highlightItems.has(item.id) ? "ring-2 ring-[#e03131]" : ""
                }`}
              >
                <p className="mb-2 text-sm font-semibold text-[#111]">
                  {item.category}
                  {!item.required && (
                    <span className="ml-1 text-xs font-normal text-[#999]">(선택)</span>
                  )}
                </p>
                <div className="flex gap-2">
                  {(["positive", "negative"] as const).map((v) => {
                    const isSelected = selected === v;
                    const isOppositeDisabled = selected != null && selected !== v;
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-disabled={isOppositeDisabled}
                        onClick={() => {
                          if (isOppositeDisabled) return;
                          handleChoice(item.id, v);
                        }}
                        className={`flex flex-1 items-center justify-center rounded-lg border px-2 py-3 text-xs leading-4 transition-colors ${
                          isSelected
                            ? v === "positive"
                              ? "border-[#01a1ff] bg-[#e8f6ff] font-medium text-[#01a1ff]"
                              : "border-[#ff6b6b] bg-[#fff0f0] font-medium text-[#e03131]"
                            : isOppositeDisabled
                              ? "cursor-not-allowed border-[#ececec] bg-[#f5f5f5] text-[#ccc] opacity-60"
                              : "border-[#e8e8e8] bg-[#f8f8f8] text-[#666]"
                        }`}
                      >
                        {v === "positive" ? item.positive : item.negative}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mt-8 flex items-start gap-2 rounded-xl border border-[#eee] bg-white px-4 py-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#ff9800] text-[10px] font-bold text-white">
            P
          </span>
          <p className="text-xs leading-5 text-[#666]">
            사진 첨부 + 80자 이상 글 작성 시 총 600P 받아요
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#111]">사진 첨부 (선택)</span>
            <PointLabel earned={hasMedia} />
          </div>
          <p className="mt-1 text-xs text-[#999]">
            사진은 최대 10장, 동영상은 1개까지 첨부할 수 있어요
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PhotoUploader
              photos={photos}
              onChange={setPhotos}
              max={10}
              variant="camera"
              thumbSize={88}
              addButtonFirst
              onAddClick={() => setMediaPickerOpen(true)}
            />
            {video && (
              <div
                className="relative shrink-0"
                style={{ width: 88, height: 88 }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#111] text-2xl text-white">
                  ▶
                </div>
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  aria-label="동영상 삭제"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#111]">후기 작성</span>
            <PointLabel earned={text.length >= 80} />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder="다른 분들이 도움을 받을 수 있도록 상담 후기를 솔직하게 공유해주세요."
            className="mt-3 h-36 w-full resize-none rounded-xl border border-[#e0e0e0] p-3 text-sm leading-6 text-[#111] outline-none placeholder:text-[#bbb]"
          />
          <p className="mt-1.5 text-xs text-[#999]">
            {text.length}자 / 최소 20자
          </p>
        </div>

        <div className="mt-8 bg-[#f8f8f8] px-4 py-5">
          <button
            type="button"
            onClick={() => setPolicyOpen(!policyOpen)}
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#111]"
          >
            오늘의 집 리뷰 정책
            <span className="text-[#999]">{policyOpen ? "▾" : "›"}</span>
          </button>
          {policyOpen && (
            <p className="mt-3 text-xs leading-5 text-[#666]">{REVIEW_POLICY_TEXT}</p>
          )}
          <p className="mt-3 text-xs leading-5 text-[#999]">{REVIEW_POLICY_DISCLAIMER}</p>

          <label className="mt-4 flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={policyAgreed}
              onChange={(e) => setPolicyAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#01a1ff]"
            />
            <span className="text-xs leading-5 text-[#666]">
              오늘의 집 리뷰 정책에 동의합니다.
            </span>
          </label>

          <label className="mt-3 flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={creatorUsageAgreed}
              onChange={(e) => setCreatorUsageAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#01a1ff]"
            />
            <span className="text-xs leading-5 text-[#666]">
              {REVIEW_CREATOR_USAGE_TEXT}
            </span>
          </label>
        </div>
      </div>

      <input
        ref={galleryRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          readPhotoFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          readPhotoFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          handleVideoPick(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mobile-fixed bottom-0 border-t border-[#eee] bg-white px-safe py-3 mobile-cta-bar">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-[#666]">받을 수 있는 포인트</span>
          <span>
            <strong className="font-semibold text-[#111]">{totalPoints}</strong>
            <span className="text-[#999]"> / 600P</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold text-white ${
            canSubmit && !submitting ? "bg-[#01a1ff]" : "bg-[#ccc]"
          }`}
        >
          등록하기
        </button>
      </div>

      <BottomSheet
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
      >
        <div className="px-4 pb-8 pt-1">
          <button
            type="button"
            onClick={() => {
              setMediaPickerOpen(false);
              galleryRef.current?.click();
            }}
            className="w-full border-b border-[#f0f0f0] py-4 text-center text-[15px] text-[#111]"
          >
            갤러리에서 선택
          </button>
          <button
            type="button"
            onClick={() => {
              setMediaPickerOpen(false);
              cameraRef.current?.click();
            }}
            className="w-full border-b border-[#f0f0f0] py-4 text-center text-[15px] text-[#111]"
          >
            카메라로 촬영
          </button>
          <button
            type="button"
            onClick={() => {
              if (video) {
                showToast("동영상은 1개만 첨부할 수 있어요");
                return;
              }
              setMediaPickerOpen(false);
              videoRef.current?.click();
            }}
            className="w-full py-4 text-center text-[15px] text-[#111]"
          >
            동영상 첨부
          </button>
        </div>
      </BottomSheet>

      <Modal
        open={showExit}
        title="작성 중인 내용이 사라져요. 나가시겠어요?"
        primaryLabel="계속 작성"
        secondaryLabel="나가기"
        onPrimary={() => setShowExit(false)}
        onSecondary={goToList}
      />
    </div>
  );
}

export default function ReviewPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-white">
          <PageHeader title="리뷰 작성" />
        </div>
      }
    >
      <ReviewPageContent params={params} />
    </Suspense>
  );
}
