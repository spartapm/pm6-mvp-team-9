"use client";

import { useRouter } from "next/navigation";
import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import PageHeader from "@/components/layout/PageHeader";
import BottomSheet from "@/components/ui/BottomSheet";
import FullscreenImageViewer from "@/components/ui/FullscreenImageViewer";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { useCancelOnBack } from "@/hooks/use-cancel-on-back";
import { formatPrice, MOCK_OHOUSE_PRODUCTS } from "@/lib/mock-data";
import { getMobileScrollContainer } from "@/lib/mobile-scroll";
import type { Answer, Consultation, Product } from "@/lib/types";

type PageProps = { params: Promise<{ id: string }> };

type ProductForm = {
  name: string;
  price: string;
  reason: string;
  purchaseUrl: string;
};

type ProductFieldErrors = Record<
  number,
  { name?: boolean; price?: boolean; purchaseUrl?: boolean; reason?: boolean }
>;

const emptyProduct = (): ProductForm => ({
  name: "",
  price: "",
  reason: "",
  purchaseUrl: "",
});

function sanitizePriceInput(value: string): string | null {
  if (value === "") return "";
  if (/[-+eE.]/.test(value)) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return null;
  return value;
}

const ERROR_BORDER = "border-[#e03131]";
const NORMAL_BORDER = "border-[#ddd]";

const COMMENT_PLACEHOLDER =
  "Bad: 막연한 설명은 지양\nGood: 폭 160cm로 20평 원룸에서 동선을 막지 않는 사이즈, 소재·기존 가구와의 조합을 구체적으로 설명";

const PRODUCT_REASON_PLACEHOLDER =
  "Bad: 예쁘고 인기 많은 소파예요\nGood: 폭 160cm로 20평 원룸에서 동선을 막지 않는 사이즈, 린넨 소재라 기존 화이트 침대 프레임과 자연스럽게 어울리고 시즌오프라 지금 15% 할인 중이에요";

const ALT_REASON_PLACEHOLDER =
  "Bad: 추천1 상품과 동일하지만 좀 더 저렴한 제품이에요\nGood: 할인이 이미 끝났을 때 대안으로 제안하는 대체 상품으로 제안하세요";

const PLACEMENT_PLACEHOLDER =
  "Bad: 소파는 현관쪽에 두세요\nGood: 소파를 창문을 등지게 배치하면 들어왔을 때 시선이 창가로 바로 열려서 공간이 넓어 보여요. 러그를 소파 앞에 깔면 거실 영역이 자연스럽게 구분됩니다";

const CAUTION_PLACEHOLDER =
  "Bad: 사이즈 꼭 확인하세요\nGood: 소파 배송 시 엘리베이터 폭 확인 필수 (보통 80cm 이상 필요). 린넨 소재는 직사광선에 오래 노출되면 변색될 수 있어서 창가 바로 앞 배치는 피하는 게 좋아요";

const WRITE_TIP =
  "추천 이유에 '왜 이 공간에 이 상품인지'를 써주세요. 예쁘다는 설명보다 사이즈·소재·기존 가구와의 조합을 구체적으로 적을수록 구매자의 확신도가 높아져요.\n필수 항목은 최소 30자 이상 작성해주세요";

const CONSULTATIONS_LIST_PATH = "/creator/consultations";

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

function isProductRowFilled(p: ProductForm) {
  return (
    p.name.trim() &&
    Number(p.price) > 0 &&
    p.purchaseUrl.trim() &&
    p.reason.trim().length >= 30
  );
}

function isTextFieldValid(value: string) {
  return value.trim().length >= 30;
}

type ValidationIssue = { fieldId: string; message: string };

function getProductRowErrors(p: ProductForm) {
  const row: ProductFieldErrors[number] = {};
  if (!p.name.trim()) row.name = true;
  if (!p.price || Number(p.price) <= 0) row.price = true;
  if (!p.purchaseUrl.trim()) row.purchaseUrl = true;
  if (p.reason.trim().length < 30) row.reason = true;
  return row;
}

function getProductIssueMessage(
  list: "products" | "alternatives",
  p: ProductForm,
  index: number,
) {
  const label = list === "products" ? "추천 상품" : "대체 상품";
  const suffix = index > 0 ? ` ${index + 1}` : "";
  if (!p.name.trim()) return `${label}${suffix} 상품명을 입력해주세요`;
  if (!p.price || Number(p.price) <= 0) return `${label}${suffix} 가격을 입력해주세요`;
  if (!p.purchaseUrl.trim()) return `${label}${suffix} 구매 링크를 입력해주세요`;
  if (p.reason.trim().length < 30) {
    return `${label}${suffix} ${list === "products" ? "추천" : "대체"} 이유는 30자 이상 작성해주세요`;
  }
  return `${label}${suffix}을 입력해주세요`;
}

function BuyerRequestReadonly({
  consultation,
  onPhotoClick,
}: {
  consultation: Consultation;
  onPhotoClick: (src: string) => void;
}) {
  const form = consultation.requestForm;
  const memberText = formatMemberText(form.members);
  const rows = [
    { label: "공간", value: form.spaceType },
    { label: "구성원", value: memberText || undefined },
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

  const firstPhoto = form.roomPhotos?.[0];

  return (
    <section className="rounded-xl border border-[#eee] bg-[#f8f8f8] p-4">
      <p className="mb-3 text-sm font-semibold text-[#111]">{consultation.buyerName}</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 text-sm leading-5">
            <span className="w-[72px] shrink-0 text-[#999]">{row.label}</span>
            <span className="text-[#111]">{row.value}</span>
          </div>
        ))}
        {firstPhoto && (
          <div className="flex gap-3 text-sm leading-5">
            <span className="w-[72px] shrink-0 text-[#999]">방 사진</span>
            <button type="button" onClick={() => onPhotoClick(firstPhoto)} className="shrink-0">
              <img
                src={firstPhoto}
                alt=""
                className="h-[72px] w-[72px] rounded-lg object-cover"
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function WriteAnswerPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    consultations,
    submitAnswer,
    saveAnswerDraft,
    getAnswerDraft,
    showToast,
  } = useApp();

  const consultation = consultations.find((c) => c.id === id);
  const [comment, setComment] = useState("");
  const [products, setProducts] = useState<ProductForm[]>([emptyProduct()]);
  const [alternatives, setAlternatives] = useState<ProductForm[]>([emptyProduct()]);
  const [layout3dUrl, setLayout3dUrl] = useState("");
  const [placementTip, setPlacementTip] = useState("");
  const [caution, setCaution] = useState("");
  const [showExit, setShowExit] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [productErrors, setProductErrors] = useState<ProductFieldErrors>({});
  const [altErrors, setAltErrors] = useState<ProductFieldErrors>({});
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    list: "products" | "alternatives";
    index: number;
  } | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const draft = getAnswerDraft(id);
    if (draft) {
      setComment(draft.comment);
      setProducts(draft.products.length ? draft.products : [emptyProduct()]);
      setAlternatives(
        draft.alternativeProducts?.length
          ? draft.alternativeProducts
          : [emptyProduct()],
      );
      setLayout3dUrl(draft.layout3dUrl ?? "");
      setPlacementTip(draft.placementTip);
      setCaution(draft.caution);
    } else if (consultation?.answer) {
      const answer = consultation.answer;
      setComment(answer.comment);
      setProducts(
        answer.products.map((p) => ({
          name: p.name,
          price: String(p.price),
          reason: p.reason,
          purchaseUrl: p.purchaseUrl ?? "",
        })),
      );
      setAlternatives(
        (answer.alternativeProducts ?? [emptyProduct()]).map((p) => ({
          name: p.name,
          price: String(p.price),
          reason: p.reason,
          purchaseUrl: p.purchaseUrl ?? "",
        })),
      );
      setLayout3dUrl(answer.layout3dUrl ?? "");
      setPlacementTip(answer.placementTip);
      setCaution(answer.caution);
    }
  }, [getAnswerDraft, id, consultation?.answer]);

  useEffect(() => {
    setAlternatives((prev) => {
      const next = [...prev];
      while (next.length < products.length) next.push(emptyProduct());
      return next.slice(0, Math.max(products.length, 1));
    });
  }, [products.length]);

  const productTotal = useMemo(
    () =>
      products.reduce(
        (sum, p) => sum + (p.name && Number(p.price) > 0 ? Number(p.price) : 0),
        0,
      ),
    [products],
  );

  const altTotal = useMemo(
    () =>
      alternatives.reduce(
        (sum, p) => sum + (p.name && Number(p.price) > 0 ? Number(p.price) : 0),
        0,
      ),
    [alternatives],
  );

  const hasUnsavedChanges =
    comment.trim().length > 0 ||
    products.some((p) => p.name || p.price || p.reason || p.purchaseUrl) ||
    alternatives.some((p) => p.name || p.price || p.reason || p.purchaseUrl) ||
    placementTip.trim().length > 0 ||
    caution.trim().length > 0 ||
    layout3dUrl.trim().length > 0;

  const leavePage = useCallback(() => {
    setShowExit(false);
    router.push(CONSULTATIONS_LIST_PATH);
  }, [router]);

  const handleBackAttempt = useCallback(() => {
    if (justSaved) {
      leavePage();
      return;
    }
    if (hasUnsavedChanges) setShowExit(true);
    else leavePage();
  }, [justSaved, hasUnsavedChanges, leavePage]);

  useCancelOnBack(hasUnsavedChanges && !justSaved, handleBackAttempt);

  const scrollToField = (fieldId: string) => {
    const el =
      fieldRefs.current[fieldId] ??
      (fieldId.startsWith("products") ? fieldRefs.current.products : null) ??
      (fieldId.startsWith("alternatives") ? fieldRefs.current.alternatives : null);
    if (!el) return;
    const container = getMobileScrollContainer();
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const top = container.scrollTop + (elRect.top - containerRect.top) - 80;
      container.scrollTo({ top, behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const validate = () => {
    const errs: string[] = [];
    const issues: ValidationIssue[] = [];
    const pErrs: ProductFieldErrors = {};
    const aErrs: ProductFieldErrors = {};

    if (!comment.trim()) {
      errs.push("comment");
      issues.push({ fieldId: "comment", message: "크리에이터 한마디를 입력해주세요" });
    }

    products.forEach((p, index) => {
      if (isProductRowFilled(p)) return;
      pErrs[index] = getProductRowErrors(p);
      if (!issues.some((issue) => issue.fieldId.startsWith("products"))) {
        errs.push("products");
        issues.push({
          fieldId: `products-${index}`,
          message: getProductIssueMessage("products", p, index),
        });
      }
    });

    for (let index = 0; index < products.length; index++) {
      const p = alternatives[index] ?? emptyProduct();
      if (isProductRowFilled(p)) continue;
      aErrs[index] = getProductRowErrors(p);
      if (!issues.some((issue) => issue.fieldId.startsWith("alternatives"))) {
        errs.push("alternatives");
        issues.push({
          fieldId: `alternatives-${index}`,
          message: getProductIssueMessage("alternatives", p, index),
        });
      }
    }

    if (!placementTip.trim()) {
      errs.push("placementTip");
      issues.push({ fieldId: "placementTip", message: "배치 팁을 입력해주세요" });
    } else if (placementTip.trim().length < 30) {
      errs.push("placementTip");
      issues.push({
        fieldId: "placementTip",
        message: "배치 팁은 30자 이상 작성해주세요",
      });
    }

    if (!caution.trim()) {
      errs.push("caution");
      issues.push({ fieldId: "caution", message: "구매 전 주의점을 입력해주세요" });
    } else if (caution.trim().length < 30) {
      errs.push("caution");
      issues.push({
        fieldId: "caution",
        message: "구매 전 주의점은 30자 이상 작성해주세요",
      });
    }

    setErrors(errs);
    setProductErrors(pErrs);
    setAltErrors(aErrs);
    return { issues };
  };

  if (!consultation) {
    return (
      <div className="p-6 text-center">
        <p>신청서를 불러올 수 없어요.</p>
        <button type="button" onClick={() => router.back()} className="mt-4 text-[#01a1ff]">
          돌아가기
        </button>
      </div>
    );
  }

  const buildAnswer = (): Answer => {
    const validProducts: Product[] = products.filter(isProductRowFilled).map((p, i) => ({
      id: `new-${i}`,
      name: p.name,
      price: Number(p.price),
      image: consultation.requestForm.roomPhotos[0] ?? "",
      reason: p.reason,
      purchaseUrl: p.purchaseUrl,
    }));

    const validAlts: Product[] = alternatives.filter(isProductRowFilled).map((p, i) => ({
      id: `alt-${i}`,
      name: p.name,
      price: Number(p.price),
      image: consultation.requestForm.roomPhotos[0] ?? "",
      reason: p.reason,
      purchaseUrl: p.purchaseUrl,
    }));

    return {
      comment,
      products: validProducts,
      alternativeProducts: validAlts.length > 0 ? validAlts : undefined,
      budgetTotal: validProducts.reduce((s, p) => s + p.price, 0),
      layout3dUrl: layout3dUrl || undefined,
      placementTip,
      caution,
    };
  };

  const handleTempSave = () => {
    saveAnswerDraft(id, {
      consultationId: id,
      comment,
      products,
      alternativeProducts: alternatives,
      layout3dUrl,
      placementTip,
      caution,
    });
    setJustSaved(true);
    showToast("임시저장되었습니다");
  };

  const handleSubmit = () => {
    const { issues } = validate();
    if (issues.length > 0) {
      showToast(issues[0].message);
      scrollToField(issues[0].fieldId);
      return;
    }
    submitAnswer(id, buildAnswer());
    showToast("큐레이션 답변을 전달했어요");
    router.push("/creator/consultations");
  };

  const syncProductRowErrors = (
    list: "products" | "alternatives",
    index: number,
    updatedRow: ProductForm,
    allRows: ProductForm[],
  ) => {
    const sectionKey = list === "products" ? "products" : "alternatives";
    const setFieldErrs = list === "products" ? setProductErrors : setAltErrors;

    setFieldErrs((prev) => {
      if (!prev[index]) return prev;
      const next = { ...prev };
      if (isProductRowFilled(updatedRow)) {
        delete next[index];
      } else {
        next[index] = getProductRowErrors(updatedRow);
      }
      return next;
    });

    if (allRows.every(isProductRowFilled)) {
      setErrors((e) => e.filter((x) => x !== sectionKey));
    }
  };

  const clearTextFieldError = (field: "comment" | "placementTip" | "caution", value: string) => {
    const isValid =
      field === "comment" ? value.trim().length > 0 : isTextFieldValid(value);
    if (errors.includes(field) && isValid) {
      setErrors((e) => e.filter((x) => x !== field));
    }
  };

  const updateProduct = (
    list: "products" | "alternatives",
    index: number,
    field: keyof ProductForm,
    value: string,
  ) => {
    if (field === "price") {
      const sanitized = sanitizePriceInput(value);
      if (sanitized === null) return;
      value = sanitized;
    }

    setJustSaved(false);
    const source = list === "products" ? products : alternatives;
    const updatedRow = { ...source[index], [field]: value };
    const nextRows = source.map((p, i) => (i === index ? updatedRow : p));

    if (list === "products") setProducts(nextRows);
    else setAlternatives(nextRows);

    syncProductRowErrors(list, index, updatedRow, nextRows);
  };

  const openProductPicker = (list: "products" | "alternatives", index: number) => {
    setPickerTarget({ list, index });
    setProductPickerOpen(true);
  };

  const selectMockProduct = (item: (typeof MOCK_OHOUSE_PRODUCTS)[number]) => {
    if (!pickerTarget) return;
    const { list, index } = pickerTarget;
    const source = list === "products" ? products : alternatives;
    const updatedRow = {
      ...source[index],
      name: item.name,
      price: String(item.price),
    };
    const nextRows = source.map((p, i) => (i === index ? updatedRow : p));

    if (list === "products") setProducts(nextRows);
    else setAlternatives(nextRows);

    syncProductRowErrors(list, index, updatedRow, nextRows);
    setProductPickerOpen(false);
    setPickerTarget(null);
    showToast(`${item.name} 상품을 선택했어요`);
  };

  const renderProductFields = (
    list: "products" | "alternatives",
    product: ProductForm,
    index: number,
    fieldErrs: ProductFieldErrors,
    reasonPlaceholder: string,
  ) => (
    <div
      key={`${list}-${index}`}
      ref={(el) => {
        fieldRefs.current[`${list}-${index}`] = el;
      }}
      className="mt-3 rounded-xl border border-[#eee] p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-[#999]">
          {list === "products" ? "추천" : "대체"} 상품 {index + 1}
        </span>
        <button
          type="button"
          className="text-xs text-[#01a1ff]"
          onClick={() => openProductPicker(list, index)}
        >
          오늘의집 상품 선택
        </button>
      </div>
      <input
        placeholder="상품명"
        value={product.name}
        onChange={(e) => updateProduct(list, index, "name", e.target.value)}
        className={`mb-2 h-10 w-full rounded-lg border px-3 text-sm outline-none ${fieldErrs[index]?.name ? ERROR_BORDER : NORMAL_BORDER}`}
      />
      <input
        placeholder="가격 (원)"
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        value={product.price}
        onKeyDown={(e) => {
          if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
        }}
        onChange={(e) => updateProduct(list, index, "price", e.target.value)}
        className={`input-no-spin mb-2 h-10 w-full rounded-lg border px-3 text-sm outline-none ${fieldErrs[index]?.price ? ERROR_BORDER : NORMAL_BORDER}`}
      />
      <input
        placeholder="구매 링크"
        value={product.purchaseUrl}
        onChange={(e) => updateProduct(list, index, "purchaseUrl", e.target.value)}
        className={`mb-2 h-10 w-full rounded-lg border px-3 text-sm outline-none ${fieldErrs[index]?.purchaseUrl ? ERROR_BORDER : NORMAL_BORDER}`}
      />
      <textarea
        placeholder={reasonPlaceholder}
        maxLength={200}
        value={product.reason}
        onChange={(e) => updateProduct(list, index, "reason", e.target.value)}
        className={`h-24 w-full resize-none rounded-lg border p-3 text-sm outline-none ${fieldErrs[index]?.reason ? ERROR_BORDER : NORMAL_BORDER}`}
      />
      <p className="mt-1 text-right text-xs text-[#999]">
        {product.reason.length}/200 (최소 30자)
      </p>
      {errors.includes(list === "products" ? "products" : "alternatives") &&
        fieldErrs[index] && (
          <p className="mt-1 text-xs text-[#e03131]">필수 항목을 입력해주세요</p>
        )}
    </div>
  );

  const showAddProduct =
    products.length < 10 && products.every(isProductRowFilled);

  return (
    <div className="min-h-full bg-white pb-write-footer">
      <PageHeader title="견적서 작성" onBack={handleBackAttempt} />

      <div className="px-safe pt-4">
        <p className="mb-2 text-sm font-semibold text-[#111]">신청서 요약</p>
        <BuyerRequestReadonly
          consultation={consultation}
          onPhotoClick={setFullscreenPhoto}
        />

        <section
          id="field-comment"
          ref={(el) => {
            fieldRefs.current.comment = el;
          }}
          className="mt-6"
        >
          <label className="text-sm font-semibold">
            크리에이터 한마디 (총평) <span className="text-[#e03131]">*</span>
          </label>
          <textarea
            maxLength={500}
            value={comment}
            onChange={(e) => {
              setJustSaved(false);
              setComment(e.target.value);
              clearTextFieldError("comment", e.target.value);
            }}
            placeholder={COMMENT_PLACEHOLDER}
            className={`mt-2 h-32 w-full resize-none rounded-xl border p-3 text-sm leading-6 outline-none ${errors.includes("comment") ? ERROR_BORDER : NORMAL_BORDER}`}
          />
          <p className="mt-1 text-right text-xs text-[#999]">{comment.length}/500</p>
          {errors.includes("comment") && (
            <p className="mt-1 text-xs text-[#e03131]">필수 항목을 입력해주세요</p>
          )}
        </section>

        <section
          id="field-products"
          ref={(el) => {
            fieldRefs.current.products = el;
          }}
          className="mt-6"
        >
          <label className="text-sm font-semibold">
            추천 상품 <span className="text-[#e03131]">*</span>
          </label>
          <p className="mt-1 text-xs text-[#999]">최대 10개 · 필수 1개 이상</p>
          {products.map((product, index) =>
            renderProductFields(
              "products",
              product,
              index,
              productErrors,
              PRODUCT_REASON_PLACEHOLDER,
            ),
          )}
          {showAddProduct && (
            <button
              type="button"
              onClick={() => {
                setJustSaved(false);
                setProducts((prev) => [...prev, emptyProduct()]);
              }}
              className="mt-2 w-full rounded-xl border border-dashed border-[#01a1ff] py-2.5 text-sm text-[#01a1ff]"
            >
              + 상품 추가
            </button>
          )}
          {products.some((p) => p.name && Number(p.price) > 0) && (
            <p className="mt-3 text-sm font-semibold text-[#111]">
              추천 합계 {formatPrice(productTotal)}
            </p>
          )}
        </section>

        <section
          id="field-alternatives"
          ref={(el) => {
            fieldRefs.current.alternatives = el;
          }}
          className="mt-6"
        >
          <label className="text-sm font-semibold">
            대체 상품 <span className="text-[#e03131]">*</span>
          </label>
          <p className="mt-1 text-xs text-[#999]">
            추천 상품 1개당 대체 상품 1개 · 최대 10개
          </p>
          {alternatives.map((product, index) =>
            renderProductFields(
              "alternatives",
              product,
              index,
              altErrors,
              ALT_REASON_PLACEHOLDER,
            ),
          )}
          {alternatives.some((p) => p.name && Number(p.price) > 0) && (
            <p className="mt-3 text-sm font-semibold text-[#111]">
              대체 합계 {formatPrice(altTotal)}
            </p>
          )}
        </section>

        <section className="mt-6">
          <label className="text-sm font-semibold">3D 배치도 링크 (선택)</label>
          <input
            value={layout3dUrl}
            onChange={(e) => {
              setJustSaved(false);
              setLayout3dUrl(e.target.value);
            }}
            placeholder="3D 배치도 링크를 입력해주세요"
            className="mt-2 h-11 w-full rounded-xl border border-[#ddd] px-3 text-sm outline-none"
          />
        </section>

        <section
          id="field-placementTip"
          ref={(el) => {
            fieldRefs.current.placementTip = el;
          }}
          className="mt-6"
        >
          <label className="text-sm font-semibold">
            배치 팁 <span className="text-[#e03131]">*</span>
          </label>
          <textarea
            maxLength={300}
            value={placementTip}
            onChange={(e) => {
              setJustSaved(false);
              setPlacementTip(e.target.value);
              clearTextFieldError("placementTip", e.target.value);
            }}
            placeholder={PLACEMENT_PLACEHOLDER}
            className={`mt-2 h-28 w-full resize-none rounded-xl border p-3 text-sm leading-6 outline-none ${errors.includes("placementTip") ? ERROR_BORDER : NORMAL_BORDER}`}
          />
          <p className="mt-1 text-right text-xs text-[#999]">{placementTip.length}/300</p>
          {errors.includes("placementTip") && (
            <p className="mt-1 text-xs text-[#e03131]">필수 항목을 입력해주세요</p>
          )}
        </section>

        <section
          id="field-caution"
          ref={(el) => {
            fieldRefs.current.caution = el;
          }}
          className="mt-6"
        >
          <label className="text-sm font-semibold">
            구매 전 주의점 <span className="text-[#e03131]">*</span>
          </label>
          <textarea
            maxLength={300}
            value={caution}
            onChange={(e) => {
              setJustSaved(false);
              setCaution(e.target.value);
              clearTextFieldError("caution", e.target.value);
            }}
            placeholder={CAUTION_PLACEHOLDER}
            className={`mt-2 h-28 w-full resize-none rounded-xl border p-3 text-sm leading-6 outline-none ${errors.includes("caution") ? ERROR_BORDER : NORMAL_BORDER}`}
          />
          <p className="mt-1 text-right text-xs text-[#999]">{caution.length}/300</p>
          {errors.includes("caution") && (
            <p className="mt-1 text-xs text-[#e03131]">필수 항목을 입력해주세요</p>
          )}
        </section>
      </div>

      <div className="mobile-fixed bottom-0 border-t border-[#eee] bg-white">
        <div className="whitespace-pre-line px-safe py-3 text-xs leading-5 text-[#666]">
          {WRITE_TIP}
        </div>
        <div className="flex gap-2 border-t border-[#f0f0f0] px-safe py-3 mobile-cta-bar">
          <button
            type="button"
            onClick={handleTempSave}
            className="h-12 flex-1 rounded-xl border border-[#ddd] text-sm font-medium text-[#111]"
          >
            임시 저장
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-12 flex-[2] rounded-xl bg-[#01a1ff] text-sm font-semibold text-white"
          >
            답변 완료하기
          </button>
        </div>
      </div>

      <BottomSheet
        open={productPickerOpen}
        onClose={() => {
          setProductPickerOpen(false);
          setPickerTarget(null);
        }}
        title="오늘의집 상품 검색"
      >
        <div className="max-h-[50vh] space-y-2 overflow-y-auto px-6 pb-8">
          {MOCK_OHOUSE_PRODUCTS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => selectMockProduct(item)}
              className="flex w-full items-center gap-3 rounded-xl border border-[#eee] p-3 text-left"
            >
              <img src={item.image} alt="" className="h-12 w-12 rounded object-cover" />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-sm text-[#01a1ff]">{formatPrice(item.price)}</p>
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

      <Modal
        open={showExit}
        title="작성 중인 내용이 있어요. 임시저장버튼을 눌러주세요"
        primaryLabel="계속 작성"
        secondaryLabel="나가기"
        onPrimary={() => setShowExit(false)}
        onSecondary={leavePage}
      />

      <FullscreenImageViewer
        src={fullscreenPhoto}
        onClose={() => setFullscreenPhoto(null)}
      />
    </div>
  );
}
