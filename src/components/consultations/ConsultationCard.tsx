"use client";

import { useEffect, useState } from "react";
import type { Consultation, Product } from "@/lib/types";
import { formatPrice } from "@/lib/mock-data";
import BuyerRequestSummary, {
  RequestPhotoSections,
} from "@/components/consultations/BuyerRequestSummary";
import FullscreenImageViewer from "@/components/ui/FullscreenImageViewer";

type ConsultationCardProps = {
  consultation: Consultation;
  mode: "buyer" | "creator";
  expanded: boolean;
  onToggle: () => void;
  onEvaluate?: () => void;
  onAddToCart?: (selectedIds: string[]) => void;
  onWriteAnswer?: () => void;
  onEditAnswer?: () => void;
  onEditBlocked?: () => void;
};

function formatMemberText(members: Consultation["requestForm"]["members"]) {
  const parts: string[] = [];
  if (members.adult > 0) parts.push(`성인 ${members.adult}명`);
  if (members.child > 0) parts.push(`아이 ${members.child}명`);
  if (members.infant > 0) parts.push(`유아 ${members.infant}명`);
  if (members.pet > 0) parts.push(`반려동물 ${members.pet}마리`);
  return parts.join(", ");
}

function getCreatorDraftBannerMessage(draftSavedAt?: string | null) {
  if (draftSavedAt) return "임시저장 · 아직 견적서를 작성하지 않았어요";
  return "아직 견적서를 작성하지 않았어요";
}

function formatBudgetText(budget: string) {
  if (budget.includes("만원") && !budget.includes(" ")) {
    return budget.replace("만원", "만 원");
  }
  return budget;
}

function getPairedAlternativeProducts(answer: NonNullable<Consultation["answer"]>) {
  const count = answer.products.length;
  return (answer.alternativeProducts ?? []).slice(0, count);
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#01a1ff]" : "bg-[#ccc]"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-[left] duration-200 ${
          checked ? "left-[22px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}

function WaitingStatusBanner({
  message,
  className = "mb-4",
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl bg-[#e8f4fd] px-3 py-2.5 text-sm text-[#01a1ff] ${className}`}
    >
      <span className="text-base leading-none" aria-hidden>
        🕐
      </span>
      <span>{message}</span>
    </div>
  );
}

function WaitingRequestSummary({
  form,
  onPhotoClick,
  sectionTitle = "내가 보낸 신청서",
}: {
  form: Consultation["requestForm"];
  onPhotoClick?: (src: string) => void;
  sectionTitle?: string;
}) {
  const rows = [
    { label: "공간", value: form.spaceType },
    { label: "구성원", value: formatMemberText(form.members) },
    {
      label: "보유가구",
      value: form.ownedFurniture?.length ? form.ownedFurniture.join(" / ") : undefined,
    },
    {
      label: "필요가구",
      value: form.neededFurniture?.length ? form.neededFurniture.join(" / ") : undefined,
    },
    { label: "스타일", value: form.style?.replace(/&/g, "·") },
    { label: "예산", value: form.budget ? formatBudgetText(form.budget) : undefined },
  ].filter((row) => row.value);

  return (
    <div>
      <p className="mb-3 text-xs text-[#999]">{sectionTitle}</p>
      <RequestPhotoSections form={form} onPhotoClick={onPhotoClick} />
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 text-sm leading-5">
            <span className="w-16 shrink-0 text-[#999]">{row.label}</span>
            <span className="text-[#111]">{row.value}</span>
          </div>
        ))}
        {form.requestNote?.trim() && (
          <div className="flex gap-3 text-sm leading-5">
            <span className="w-16 shrink-0 text-[#999]">요청사항</span>
            <span className="whitespace-pre-line text-[#111]">{form.requestNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CreatorBuyerRequestSummary({
  form,
  onPhotoClick,
}: {
  form: Consultation["requestForm"];
  onPhotoClick?: (src: string) => void;
}) {
  return <BuyerRequestSummary form={form} onPhotoClick={onPhotoClick} />;
}

function RequestSummary({
  form,
  onPhotoClick,
}: {
  form: Consultation["requestForm"];
  onPhotoClick?: (src: string) => void;
}) {
  const members = form.members;
  const memberText = members
    ? `성인 ${members.adult} / 아이 ${members.child} / 유아 ${members.infant} / 반려동물 ${members.pet}`
    : "";

  const items = [
    form.spaceType && `공간: ${form.spaceType}`,
    memberText && `구성원: ${memberText}`,
    form.width && form.height && `크기: ${form.width}m × ${form.height}m`,
    form.ownedFurniture?.length && `보유 가구: ${form.ownedFurniture.join(" / ")}`,
    form.neededFurniture?.length && `필요 가구: ${form.neededFurniture.join(" / ")}`,
    form.style && `스타일: ${form.style}`,
    form.budget && `예산: ${form.budget}`,
    form.requestNote && `요청: ${form.requestNote}`,
  ].filter(Boolean);

  return (
    <div className="space-y-2 text-sm text-[#333]">
      {form.roomPhotos?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {form.roomPhotos.map((photo, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPhotoClick?.(photo)}
              className="shrink-0"
            >
              <img
                src={photo}
                alt=""
                className="h-16 w-16 rounded-lg object-cover"
              />
            </button>
          ))}
        </div>
      )}
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}

export default function ConsultationCard({
  consultation,
  mode,
  expanded,
  onToggle,
  onEvaluate,
  onAddToCart,
  onWriteAnswer,
  onEditAnswer,
  onEditBlocked,
}: ConsultationCardProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    consultation.answer?.products.map((p) => p.id) ?? [],
  );
  const [showAlt, setShowAlt] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  const isWaiting = consultation.status === "WAITING";
  const isDone = consultation.status === "DONE" || consultation.status === "RATED";
  const answer = consultation.answer;

  const pairedAlternatives = answer ? getPairedAlternativeProducts(answer) : [];
  const hasAlternatives = pairedAlternatives.length > 0;

  const displayedProducts: Product[] =
    showAlt && hasAlternatives ? pairedAlternatives : answer?.products ?? [];

  const creatorProductTotal = displayedProducts.reduce((sum, p) => sum + p.price, 0);

  useEffect(() => {
    setShowAlt(false);
  }, [consultation.id]);

  useEffect(() => {
    if (!answer) return;
    const alts = getPairedAlternativeProducts(answer);
    const products = showAlt && alts.length > 0 ? alts : answer.products;
    setSelectedProducts(products.map((p) => p.id));
  }, [showAlt, answer]);

  const total = displayedProducts
    .filter((p) => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const headerName = mode === "buyer" ? consultation.creatorName : consultation.buyerName;
  const headerAvatar = mode === "buyer" ? consultation.creatorAvatar : consultation.buyerAvatar;

  const waitingExpanded = mode === "buyer" && isWaiting && expanded;
  const doneExpanded = isDone && expanded;
  const showUnreadDot = mode === "buyer" && isDone && !consultation.isRead;
  const proposalSubtitle = `${consultation.buyerName}님을 위한 맞춤형 공간 스타일링 제안`;
  const buyerWaiting = mode === "buyer" && isWaiting;
  const creatorWaiting = mode === "creator" && isWaiting;
  const creatorWaitingExpanded = creatorWaiting && expanded;

  const card = (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        waitingExpanded || doneExpanded
          ? "border-[#01a1ff] bg-white"
          : creatorWaitingExpanded
            ? "border-[#01a1ff] bg-[#f0f8ff]"
            : "border-[#e8e8e8] bg-white"
      }`}
    >
      {showUnreadDot && (
        <span className="absolute left-3 top-3 z-10 h-2 w-2 rounded-full bg-[#ff5252]" />
      )}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <img
          src={headerAvatar}
          alt=""
          className={`h-11 w-11 shrink-0 rounded-full object-cover ${
            mode === "creator" ? "pointer-events-none select-none" : ""
          }`}
        />
        <div className="min-w-0 flex-1">
          <span className="text-[15px] font-bold text-[#111]">{headerName}</span>
          {isDone && (mode === "buyer" || expanded) ? (
            <p className="mt-0.5 text-xs leading-4 text-[#01a1ff]">{proposalSubtitle}</p>
          ) : buyerWaiting || creatorWaiting ? (
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="text-xs leading-4 text-[#999]">
                {consultation.requestedAt} 신청
              </p>
              <span className="rounded bg-[#e03131] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                D-{consultation.dDay}
              </span>
            </div>
          ) : !isDone ? (
            <p className="mt-0.5 text-xs leading-4 text-[#999]">
              {consultation.requestedAt} 신청
            </p>
          ) : null}
        </div>
        <span className="shrink-0 px-1 text-sm text-[#ccc]" aria-hidden>
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="min-w-0 border-t border-[#f0f0f0] px-4 pb-4 pt-3">
          {mode === "buyer" && isWaiting && (
            <WaitingRequestSummary
              form={consultation.requestForm}
              onPhotoClick={setFullscreenPhoto}
            />
          )}

          {creatorWaiting && (
            <>
              <WaitingStatusBanner
                message={getCreatorDraftBannerMessage(consultation.draftSavedAt)}
              />
              <CreatorBuyerRequestSummary
                form={consultation.requestForm}
                onPhotoClick={setFullscreenPhoto}
              />
              <button
                type="button"
                onClick={onWriteAnswer}
                className="mt-4 w-full rounded-xl bg-[#e03131] py-3.5 text-sm font-semibold text-white"
              >
                {consultation.draftSavedAt
                  ? `견적서 이어서 작성하기 D-${consultation.dDay}`
                  : `견적서 작성하기 D-${consultation.dDay}`}
              </button>
            </>
          )}

          {mode === "buyer" && isDone && answer && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#f5f5f5] px-3 py-3 text-sm leading-6 text-[#333]">
                {answer.comment}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#111]">추천 상품</p>
                  <button
                    type="button"
                    onClick={() => setSelectedProducts([])}
                    className="text-xs text-[#999]"
                  >
                    선택해제
                  </button>
                </div>
                <div className="mt-2 divide-y divide-[#f0f0f0]">
                  {displayedProducts.map((product) => (
                    <label key={product.id} className="flex gap-3 py-3 first:pt-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          setSelectedProducts((prev) =>
                            e.target.checked
                              ? [...prev, product.id]
                              : prev.filter((id) => id !== product.id),
                          );
                        }}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#111]"
                      />
                      <img
                        src={product.image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="break-anywhere text-sm font-medium text-[#111]">{product.name}</p>
                        <p className="mt-0.5 text-sm font-semibold text-[#111]">
                          {formatPrice(product.price)}
                        </p>
                        <p className="mt-1 break-anywhere text-xs leading-5 text-[#666]">{product.reason}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {hasAlternatives && (
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <span className="text-xs text-[#666]">대체상품</span>
                    <ToggleSwitch
                      checked={showAlt}
                      onChange={setShowAlt}
                      label="대체상품 보기"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#f0f8ff] px-4 py-3">
                <span className="text-sm text-[#111]">합계</span>
                <span className="text-base font-bold text-[#01a1ff]">
                  {formatPrice(total)}
                </span>
              </div>

              {answer.layout3dUrl && (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[#01a1ff]/40 bg-white py-3 text-center text-sm font-semibold text-[#01a1ff]/50"
                >
                  3D 배치도 보러가기
                </button>
              )}

              <div>
                <p className="text-sm font-semibold text-[#111]">배치 팁</p>
                <p className="mt-1 text-sm leading-6 text-[#666]">{answer.placementTip}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111]">구매 전 주의점</p>
                <p className="mt-1 text-sm leading-6 text-[#666]">{answer.caution}</p>
              </div>

              <div className="flex gap-2 pt-1">
                {consultation.status === "RATED" ? (
                  <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#f5f5f5] text-sm text-[#666]">
                    ★ {consultation.rating?.score ?? 0}점 · 평가 완료
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onEvaluate}
                    className="relative flex h-12 flex-1 flex-col items-center justify-center rounded-xl border border-[#ddd] bg-white text-sm font-medium text-[#111]"
                  >
                    <span className="absolute -top-2 rounded bg-white px-1 text-[10px] font-semibold text-[#01a1ff]">
                      최대 600P 획득
                    </span>
                    <span>★ 평가하기</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onAddToCart?.(selectedProducts)}
                  className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#01a1ff] text-sm font-semibold text-white"
                >
                  <span aria-hidden>🛒</span>
                  한번에 담기
                </button>
              </div>
            </div>
          )}

          {mode === "creator" && isDone && answer && (
            <div className="min-w-0 space-y-4">
              <div className="break-anywhere min-w-0 rounded-xl bg-[#f5f5f5] px-3 py-3 text-sm leading-6 text-[#333]">
                {answer.comment}
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#111]">추천 상품</p>
                  {hasAlternatives && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#666]">대체상품</span>
                      <ToggleSwitch
                        checked={showAlt}
                        onChange={setShowAlt}
                        label="대체상품 보기"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-2 divide-y divide-[#f0f0f0]">
                  {displayedProducts.map((product) => (
                    <div key={product.id} className="flex gap-3 py-3 first:pt-2">
                      <img
                        src={product.image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="break-anywhere text-sm font-medium text-[#111]">{product.name}</p>
                        <p className="mt-0.5 text-sm font-semibold text-[#111]">
                          {formatPrice(product.price)}
                        </p>
                        <p className="mt-1 break-anywhere text-xs leading-5 text-[#666]">{product.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#f0f8ff] px-4 py-3">
                <span className="text-sm text-[#111]">합계</span>
                <span className="text-base font-bold text-[#01a1ff]">
                  {formatPrice(creatorProductTotal)}
                </span>
              </div>

              {answer.layout3dUrl && (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[#01a1ff]/40 bg-white py-3 text-center text-sm font-semibold text-[#01a1ff]/50"
                >
                  3D 배치도 보러가기
                </button>
              )}

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111]">배치 팁</p>
                <p className="break-anywhere mt-1 text-sm leading-6 text-[#666]">{answer.placementTip}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111]">구매 전 주의점</p>
                <p className="break-anywhere mt-1 text-sm leading-6 text-[#666]">{answer.caution}</p>
              </div>

              <button
                type="button"
                disabled={consultation.isRead}
                onClick={() => {
                  if (consultation.isRead) {
                    onEditBlocked?.();
                    return;
                  }
                  onEditAnswer?.();
                }}
                className="w-full rounded-xl border border-[#ddd] py-3.5 text-sm font-medium text-[#111] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {consultation.isRead ? "구매자 확인 완료 · 수정 불가" : "수정하기"}
              </button>
            </div>
          )}
        </div>
      )}

      <FullscreenImageViewer
        src={fullscreenPhoto}
        onClose={() => setFullscreenPhoto(null)}
      />
    </div>
  );

  if (buyerWaiting) {
    return (
      <div className="mb-3 px-safe">
        {card}
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#e8f4fd] px-4 py-3 text-sm text-[#01a1ff]">
          <span className="text-base leading-none" aria-hidden>
            🕐
          </span>
          <span>크리에이터가 확인하고 있어요</span>
        </div>
      </div>
    );
  }

  if (creatorWaiting && !expanded) {
    return (
      <div className="mb-3 px-safe">
        {card}
        <WaitingStatusBanner
          className="mt-2"
          message={getCreatorDraftBannerMessage(consultation.draftSavedAt)}
        />
      </div>
    );
  }

  if (creatorWaiting) {
    return <div className="mb-3 px-safe">{card}</div>;
  }

  return <div className="mb-3 px-safe">{card}</div>;
}
