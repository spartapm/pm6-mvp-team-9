"use client";

import { APPLY_PREVIEW_IMAGES } from "@/lib/constants";
import type { Consultation } from "@/lib/types";

function formatMemberText(members: Consultation["requestForm"]["members"]) {
  const parts: string[] = [];
  if (members.adult > 0) parts.push(`성인 ${members.adult}명`);
  if (members.child > 0) parts.push(`아이 ${members.child}명`);
  if (members.infant > 0) parts.push(`유아 ${members.infant}명`);
  if (members.pet > 0) parts.push(`반려동물 ${members.pet}마리`);
  return parts.join(", ");
}

function formatBudgetText(budget: string) {
  if (budget.includes("만원") && !budget.includes(" ")) {
    return budget.replace("만원", "만 원");
  }
  return budget;
}

function getLabeledRequestPhotoSections(form: Consultation["requestForm"]) {
  return [
    {
      label: "인테리어 공간",
      photo: form.roomPhotos?.[0] ?? APPLY_PREVIEW_IMAGES.roomPhotos[0],
    },
    {
      label: "보유가구",
      photo: form.ownedFurniturePhotos?.[0] ?? APPLY_PREVIEW_IMAGES.ownedFurniturePhotos[0],
    },
    {
      label: "원하는 스타일",
      photo: form.referencePhotos?.[0] ?? APPLY_PREVIEW_IMAGES.referencePhotos[0],
    },
  ];
}

export function RequestPhotoSections({
  form,
  onPhotoClick,
}: {
  form: Consultation["requestForm"];
  onPhotoClick?: (src: string) => void;
}) {
  return (
    <div className="mb-4 space-y-4">
      {getLabeledRequestPhotoSections(form).map(({ label, photo }) => (
        <div key={label}>
          <p className="text-sm text-[#999]">{label}</p>
          <button
            type="button"
            onClick={() => onPhotoClick?.(photo)}
            className="mt-2 shrink-0"
          >
            <img src={photo} alt="" className="h-[72px] w-[72px] rounded-lg object-cover" />
          </button>
        </div>
      ))}
    </div>
  );
}

type BuyerRequestSummaryProps = {
  form: Consultation["requestForm"];
  onPhotoClick?: (src: string) => void;
  sectionTitle?: string;
  showSectionTitle?: boolean;
  labelWidth?: string;
};

export default function BuyerRequestSummary({
  form,
  onPhotoClick,
  sectionTitle = "구매자 신청서",
  showSectionTitle = true,
  labelWidth = "w-[72px]",
}: BuyerRequestSummaryProps) {
  const rows = [
    { label: "공간", value: form.spaceType },
    { label: "구성원", value: formatMemberText(form.members) || undefined },
    { label: "예산", value: form.budget ? formatBudgetText(form.budget) : undefined },
    { label: "스타일", value: form.style?.replace(/&/g, "·") },
    {
      label: "보유 가구",
      value: form.ownedFurniture?.length ? form.ownedFurniture.join(" / ") : undefined,
    },
    {
      label: "필요한 가구",
      value: form.neededFurniture?.length ? form.neededFurniture.join(" / ") : undefined,
    },
  ].filter((row) => row.value);

  return (
    <div>
      {showSectionTitle && (
        <p className="mb-3 text-xs text-[#999]">{sectionTitle}</p>
      )}
      <RequestPhotoSections form={form} onPhotoClick={onPhotoClick} />
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 text-sm leading-5">
            <span className={`${labelWidth} shrink-0 text-[#999]`}>{row.label}</span>
            <span className="text-[#111]">{row.value}</span>
          </div>
        ))}
        {form.requestNote?.trim() && (
          <div className="flex gap-3 text-sm leading-5">
            <span className={`${labelWidth} shrink-0 text-[#999]`}>요청사항</span>
            <span className="whitespace-pre-line text-[#111]">{form.requestNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}
