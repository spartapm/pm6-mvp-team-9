"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import ApplyStepLayout from "@/components/apply/ApplyStepLayout";
import PhotoUploader from "@/components/apply/PhotoUploader";
import {
  APPLY_STEPS,
  BUDGET_OPTIONS,
  CAUTION_TEXT,
  FURNITURE_BY_SPACE,
  OWNED_FURNITURE,
  SPACE_TYPES,
  STYLE_OPTIONS,
} from "@/lib/constants";
import { useApp } from "@/context/AppContext";
import type { RequestForm } from "@/lib/types";

type StepPageProps = {
  params: Promise<{ step: string }>;
};

const defaultMembers = { adult: 0, child: 0, infant: 0, pet: 0 };

function normalizeMembers(members?: Partial<typeof defaultMembers>) {
  return {
    adult: members?.adult ?? 0,
    child: members?.child ?? 0,
    infant: members?.infant ?? 0,
    pet: members?.pet ?? 0,
  };
}

function getMembersTotal(members: ReturnType<typeof normalizeMembers>) {
  return members.adult + members.child + members.infant + members.pet;
}

type DimensionField = "width" | "height";

const POSITIVE_DIMENSION_PATTERN = /^(|[1-9]\d*(\.\d*)?|0\.\d*)$/;

function isValidDimensionInput(raw: string) {
  return POSITIVE_DIMENSION_PATTERN.test(raw);
}

function parseDimensionValue(raw: string): number | undefined {
  if (!raw || raw.endsWith(".")) return undefined;
  const num = Number(raw);
  return num > 0 ? num : undefined;
}

function isDimensionStepValid(inputs: Record<DimensionField, string>) {
  return (
    parseDimensionValue(inputs.width) != null && parseDimensionValue(inputs.height) != null
  );
}

function formatDimensionInput(value?: number) {
  return value != null && value > 0 ? String(value) : "";
}
const ERROR_BORDER = "border-[#e03131]";
const NORMAL_BORDER = "border-[#ddd]";

export default function ApplyStepPage({ params }: StepPageProps) {
  const { step: stepParam } = use(params);
  const stepIndex = Number(stepParam);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applyForm, setApplyForm, submitApplication, clearApplyForm } = useApp();

  const creatorId =
    searchParams.get("creatorId") ||
    (typeof window !== "undefined" ? sessionStorage.getItem("applyCreatorId") : "") ||
    "5";
  const creatorName =
    searchParams.get("creatorName") ||
    (typeof window !== "undefined" ? sessionStorage.getItem("applyCreatorName") : "") ||
    "곽춘팔";
  const creatorAvatar =
    (typeof window !== "undefined" ? sessionStorage.getItem("applyCreatorAvatar") : "") ||
    "";

  const step = APPLY_STEPS[stepIndex];
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [dimensionInputs, setDimensionInputs] = useState<Record<DimensionField, string>>({
    width: "",
    height: "",
  });

  const spaceType = applyForm.spaceType ?? "";
  const neededOptions = FURNITURE_BY_SPACE[spaceType] ?? FURNITURE_BY_SPACE.기타;
  const members = normalizeMembers(applyForm.members);
  const membersTotal = getMembersTotal(members);
  const isMembersStepInvalid = stepIndex === 1 && membersTotal === 0;
  const isSizeStepInvalid = stepIndex === 2 && !isDimensionStepValid(dimensionInputs);
  const isAgreeStepInvalid = stepIndex === 8 && !applyForm.agreed;

  useEffect(() => {
    if (stepIndex === 2) {
      setDimensionInputs({
        width: formatDimensionInput(applyForm.width),
        height: formatDimensionInput(applyForm.height),
      });
    }
  }, [stepIndex]);

  useEffect(() => {
    if (stepIndex > 1 && membersTotal === 0) {
      router.replace(`/apply/step/1?creatorId=${creatorId}`);
    }
  }, [stepIndex, membersTotal, creatorId, router]);

  useEffect(() => {
    const hasValidSize =
      applyForm.width != null &&
      applyForm.width > 0 &&
      applyForm.height != null &&
      applyForm.height > 0;
    if (stepIndex > 2 && !hasValidSize) {
      router.replace(`/apply/step/2?creatorId=${creatorId}`);
    }
  }, [stepIndex, applyForm.width, applyForm.height, creatorId, router]);

  const errBorder = (field: string) =>
    fieldErrors.has(field) ? ERROR_BORDER : NORMAL_BORDER;

  const errRing = (field: string) =>
    fieldErrors.has(field) ? "rounded-lg ring-2 ring-[#e03131] p-2 -m-2" : "";

  const clearField = (field: string) => {
    if (!fieldErrors.has(field)) return;
    setFieldErrors((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const goNext = useCallback(
    (path: string) => {
      const q = `?creatorId=${creatorId}`;
      router.push(`${path}${q}`);
    },
    [creatorId, router],
  );

  const validateAndNext = () => {
    setError("");
    setFieldErrors(new Set());

    if (stepIndex === 0) {
      const errors = new Set<string>();
      if (!spaceType) errors.add("spaceType");
      if (spaceType === "기타" && !applyForm.spaceTypeOther?.trim()) errors.add("spaceTypeOther");
      if (errors.size) {
        setFieldErrors(errors);
        setError(errors.has("spaceTypeOther") ? "텍스트를 입력해주세요." : "필수 입력 항목입니다.");
        return;
      }
    }

    if (stepIndex === 1) {
      if (membersTotal === 0) {
        setFieldErrors(new Set(["members"]));
        setError("한 명 이상 입력해주세요");
        return;
      }
    }

    if (stepIndex === 2) {
      const errors = new Set<string>();
      const width = parseDimensionValue(dimensionInputs.width);
      const height = parseDimensionValue(dimensionInputs.height);
      if (width == null) errors.add("width");
      if (height == null) errors.add("height");
      if (errors.size) {
        setFieldErrors(errors);
        setError(
          errors.size === 2
            ? "필수 입력 항목입니다."
            : errors.has("width")
              ? "가로 길이를 입력해주세요."
              : "세로 길이를 입력해주세요.",
        );
        return;
      }
      setApplyForm({ width, height });
    }

    if (stepIndex === 3) {
      if (!applyForm.roomPhotos?.length) {
        setFieldErrors(new Set(["roomPhotos"]));
        setError("필수 입력 항목입니다.");
        return;
      }
    }

    if (stepIndex === 5) {
      if (applyForm.neededFurniture?.includes("기타") && !applyForm.neededFurnitureOther?.trim()) {
        setFieldErrors(new Set(["neededFurnitureOther"]));
        setError("텍스트를 입력해주세요.");
        return;
      }
    }

    if (stepIndex === 6) {
      if (!applyForm.budget) {
        setFieldErrors(new Set(["budget"]));
        setError("필수 입력 항목입니다.");
        return;
      }
    }

    if (stepIndex === 7) {
      const errors = new Set<string>();
      if (!applyForm.style) errors.add("style");
      if (applyForm.style === "기타" && !applyForm.styleOther?.trim()) errors.add("styleOther");
      if (errors.size) {
        setFieldErrors(errors);
        setError(errors.has("styleOther") ? "텍스트를 입력해주세요." : "필수 입력 항목입니다.");
        return;
      }
    }

    if (stepIndex === 8) {
      if (!applyForm.agreed) {
        setFieldErrors(new Set(["agreed"]));
        setError("주의사항 확인에 동의해주세요.");
        return;
      }
      const form: RequestForm = {
        spaceType,
        spaceTypeOther: applyForm.spaceTypeOther,
        members: members,
        width: applyForm.width,
        height: applyForm.height,
        roomPhotos: applyForm.roomPhotos ?? [],
        ownedFurniture: applyForm.ownedFurniture ?? [],
        ownedFurnitureOther: applyForm.ownedFurnitureOther,
        ownedFurniturePhotos: applyForm.ownedFurniturePhotos ?? [],
        neededFurniture: applyForm.neededFurniture ?? [],
        neededFurnitureOther: applyForm.neededFurnitureOther,
        budget: applyForm.budget ?? "",
        style: applyForm.style ?? "",
        styleOther: applyForm.styleOther,
        requestNote: applyForm.requestNote,
        referencePhotos: applyForm.referencePhotos ?? [],
      };
      submitApplication(form, creatorId, creatorName, creatorAvatar);
      clearApplyForm();
      router.push("/apply/complete");
      return;
    }

    goNext(`/apply/step/${stepIndex + 1}`);
  };

  if (!step) {
    return <div className="p-6">잘못된 단계입니다.</div>;
  }

  return (
    <ApplyStepLayout
      stepIndex={stepIndex}
      title={step.title}
      subtitle={"subtitle" in step ? step.subtitle : undefined}
      error={error}
      onNext={validateAndNext}
      nextLabel={stepIndex === 8 ? "신청완료" : "다음"}
      nextDisabled={isMembersStepInvalid || isSizeStepInvalid || isAgreeStepInvalid}
      backHref={`/creators/${creatorId}`}
    >
      {stepIndex === 0 && (
        <div className="space-y-4">
          <div className={errRing("spaceType")}>
            {SPACE_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-3 py-1">
                <input
                  type="radio"
                  name="spaceType"
                  checked={spaceType === type}
                  onChange={() => {
                    clearField("spaceType");
                    setApplyForm({
                      spaceType: type,
                      spaceTypeOther: type !== "기타" ? undefined : applyForm.spaceTypeOther,
                    });
                  }}
                  className="h-4 w-4 accent-[#01a1ff]"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            disabled={spaceType !== "기타"}
            maxLength={30}
            placeholder="직접 입력"
            value={applyForm.spaceTypeOther ?? ""}
            onChange={(e) => {
              clearField("spaceTypeOther");
              setApplyForm({ spaceTypeOther: e.target.value });
            }}
            className={`h-12 w-full rounded-lg border px-4 text-sm disabled:bg-[#f5f5f5] ${errBorder("spaceTypeOther")}`}
          />
        </div>
      )}

      {stepIndex === 1 && (
        <div className={`space-y-3 ${errRing("members")}`}>
          {(
            [
              ["adult", "성인"],
              ["child", "아이"],
              ["infant", "유아"],
              ["pet", "반려동물"],
            ] as const
          ).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-[#eee] px-4 py-3"
              >
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setApplyForm({
                        members: {
                          ...members,
                          [key]: Math.max(0, members[key] - 1),
                        },
                      });
                      if (getMembersTotal({ ...members, [key]: Math.max(0, members[key] - 1) }) > 0) {
                        clearField("members");
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-lg"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-base font-semibold">
                    {members[key]}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearField("members");
                      setApplyForm({
                        members: { ...members, [key]: members[key] + 1 },
                      });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {stepIndex === 2 && (
        <div className="space-y-6">
          {(["width", "height"] as const).map((field, i) => (
            <div key={field}>
              <label className="text-sm text-[#333]">{i === 0 ? "가로" : "세로"}</label>
              <div className="relative mt-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="직접 입력"
                  value={dimensionInputs[field]}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!isValidDimensionInput(raw)) return;
                    clearField(field);
                    setDimensionInputs((prev) => ({ ...prev, [field]: raw }));
                    setApplyForm({ [field]: parseDimensionValue(raw) });
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`input-no-spin h-12 w-full rounded-lg border px-4 pr-10 text-sm ${errBorder(field)}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#666]">
                  m
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {stepIndex === 3 && (
        <PhotoUploader
          photos={applyForm.roomPhotos ?? []}
          onChange={(roomPhotos) => {
            clearField("roomPhotos");
            setApplyForm({ roomPhotos });
          }}
          hasError={fieldErrors.has("roomPhotos")}
        />
      )}

      {stepIndex === 4 && (
        <div>
          <div className="space-y-3">
            {OWNED_FURNITURE.map((item) => (
              <label key={item} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={applyForm.ownedFurniture?.includes(item)}
                  onChange={(e) => {
                    const current = applyForm.ownedFurniture ?? [];
                    setApplyForm({
                      ownedFurniture: e.target.checked
                        ? [...current, item]
                        : current.filter((v) => v !== item),
                    });
                  }}
                  className="accent-[#01a1ff]"
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            disabled={!applyForm.ownedFurniture?.includes("기타")}
            maxLength={30}
            placeholder="직접 입력"
            value={applyForm.ownedFurnitureOther ?? ""}
            onChange={(e) => setApplyForm({ ownedFurnitureOther: e.target.value })}
            className="mt-4 h-12 w-full rounded-lg border border-[#ddd] px-4 text-sm disabled:bg-[#f5f5f5]"
          />
          <p className="mt-8 text-base font-medium">사진을 첨부해주세요(선택)</p>
          <p className="mt-1 text-sm text-[#666]">
            보유 가구에 대한 사진을 첨부하면 더 정확한 견적을 받을 수 있어요. (최대 10장)
          </p>
          <div className="mt-4">
            <PhotoUploader
              photos={applyForm.ownedFurniturePhotos ?? []}
              onChange={(ownedFurniturePhotos) => setApplyForm({ ownedFurniturePhotos })}
            />
          </div>
        </div>
      )}

      {stepIndex === 5 && (
        <div className="space-y-3">
          {neededOptions.map((item) => (
            <label key={item} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={applyForm.neededFurniture?.includes(item)}
                onChange={(e) => {
                  const current = applyForm.neededFurniture ?? [];
                  setApplyForm({
                    neededFurniture: e.target.checked
                      ? [...current, item]
                      : current.filter((v) => v !== item),
                  });
                }}
                className="accent-[#01a1ff]"
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
          <input
            type="text"
            disabled={!applyForm.neededFurniture?.includes("기타")}
            maxLength={30}
            placeholder="직접 입력"
            value={applyForm.neededFurnitureOther ?? ""}
            onChange={(e) => {
              clearField("neededFurnitureOther");
              setApplyForm({ neededFurnitureOther: e.target.value });
            }}
            className={`mt-2 h-12 w-full rounded-lg border px-4 text-sm disabled:bg-[#f5f5f5] ${errBorder("neededFurnitureOther")}`}
          />
        </div>
      )}

      {stepIndex === 6 && (
        <div className={errRing("budget")}>
          {BUDGET_OPTIONS.map((budget) => (
            <label key={budget} className="flex items-center gap-3 py-1">
              <input
                type="radio"
                name="budget"
                checked={applyForm.budget === budget}
                onChange={() => {
                  clearField("budget");
                  setApplyForm({ budget });
                }}
                className="accent-[#01a1ff]"
              />
              <span className="text-sm">{budget}</span>
            </label>
          ))}
        </div>
      )}

      {stepIndex === 7 && (
        <div className="space-y-3">
          <div className={errRing("style")}>
            {STYLE_OPTIONS.map((style) => (
              <label key={style} className="flex items-center gap-3 py-1">
                <input
                  type="radio"
                  name="style"
                  checked={applyForm.style === style}
                  onChange={() => {
                    clearField("style");
                    setApplyForm({ style });
                  }}
                  className="accent-[#01a1ff]"
                />
                <span className="text-sm">{style}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            disabled={applyForm.style !== "기타"}
            maxLength={30}
            placeholder="직접 입력"
            value={applyForm.styleOther ?? ""}
            onChange={(e) => {
              clearField("styleOther");
              setApplyForm({ styleOther: e.target.value });
            }}
            className={`h-12 w-full rounded-lg border px-4 text-sm disabled:bg-[#f5f5f5] ${errBorder("styleOther")}`}
          />
        </div>
      )}

      {stepIndex === 8 && (
        <div>
          <textarea
            maxLength={300}
            placeholder="특이사항, 원하는 스타일 등"
            value={applyForm.requestNote ?? ""}
            onChange={(e) => setApplyForm({ requestNote: e.target.value })}
            className="h-40 w-full rounded-lg border border-[#ddd] p-4 text-sm outline-none"
          />
          <p className="mt-6 text-base font-medium">사진을 첨부해주세요(선택)</p>
          <p className="mt-1 text-sm text-[#666]">
            원하시는 스타일의 참고 이미지가 있다면 첨부해주세요
          </p>
          <div className="mt-3">
            <PhotoUploader
              photos={applyForm.referencePhotos ?? []}
              onChange={(referencePhotos) => setApplyForm({ referencePhotos })}
            />
          </div>
          <p className="mt-8 text-base font-semibold">주의사항</p>
          <p className="mt-2 text-sm leading-6 text-[#666]">{CAUTION_TEXT}</p>
          <label className={`mt-4 flex items-start gap-3 ${errRing("agreed")}`}>
            <input
              type="checkbox"
              checked={applyForm.agreed ?? false}
              onChange={(e) => {
                clearField("agreed");
                setApplyForm({ agreed: e.target.checked });
              }}
              className="mt-1 accent-[#01a1ff]"
            />
            <span className="text-sm">위 내용을 충분히 확인하였습니다.</span>
          </label>
        </div>
      )}
    </ApplyStepLayout>
  );
}
