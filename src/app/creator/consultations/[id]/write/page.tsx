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
import BuyerRequestSummary from "@/components/consultations/BuyerRequestSummary";
import { getMobileScrollContainer } from "@/lib/mobile-scroll";
import type { Answer, Consultation, Product } from "@/lib/types";

type PageProps = { params: Promise<{ id: string }> };

type ProductForm = {
  name: string;
  price: string;
  reason: string;
  purchaseUrl: string;
};

type ProductPairForm = {
  product: ProductForm;
  alternative: ProductForm;
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

const emptyPair = (): ProductPairForm => ({
  product: emptyProduct(),
  alternative: emptyProduct(),
});

function parseOhzipNumber(url: string): number | null {
  const match = url.trim().match(/^ohzip\.com\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function generateUniqueOhzipUrl(existingUrls: string[]): string {
  const used = new Set(
    existingUrls
      .map(parseOhzipNumber)
      .filter((n): n is number => n !== null),
  );
  let num: number;
  do {
    num = Math.floor(Math.random() * 900) + 100;
  } while (used.has(num));
  return `ohzip.com/${num}`;
}

function zipProductPairs(
  productRows: ProductForm[],
  alternativeRows: ProductForm[],
): ProductPairForm[] {
  const length = Math.max(productRows.length, alternativeRows.length, 1);
  return Array.from({ length }, (_, index) => ({
    product: productRows[index] ?? emptyProduct(),
    alternative: alternativeRows[index] ?? emptyProduct(),
  }));
}

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
  return (
    <section className="rounded-xl border border-[#eee] bg-[#f8f8f8] p-4">
      <p className="mb-3 text-sm font-semibold text-[#111]">{consultation.buyerName}</p>
      <BuyerRequestSummary
        form={consultation.requestForm}
        onPhotoClick={onPhotoClick}
        showSectionTitle={false}
      />
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
    answerDrafts,
    hydrated,
    showToast,
  } = useApp();

  const consultation = consultations.find((c) => c.id === id);
  const [comment, setComment] = useState("");
  const [productPairs, setProductPairs] = useState<ProductPairForm[]>([emptyPair()]);
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
  const initializedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || initializedIdRef.current === id) return;
    initializedIdRef.current = id;

    const draft = answerDrafts[id];
    if (draft) {
      setComment(draft.comment);
      setProductPairs(
        zipProductPairs(draft.products ?? [], draft.alternativeProducts ?? []),
      );
      setLayout3dUrl(draft.layout3dUrl ?? "");
      setPlacementTip(draft.placementTip);
      setCaution(draft.caution);
      return;
    }

    if (consultation?.answer) {
      const answer = consultation.answer;
      setComment(answer.comment);
      setProductPairs(
        zipProductPairs(
          answer.products.map((p) => ({
            name: p.name,
            price: String(p.price),
            reason: p.reason,
            purchaseUrl: p.purchaseUrl ?? "",
          })),
          (answer.alternativeProducts ?? []).map((p) => ({
            name: p.name,
            price: String(p.price),
            reason: p.reason,
            purchaseUrl: p.purchaseUrl ?? "",
          })),
        ),
      );
      setLayout3dUrl(answer.layout3dUrl ?? "");
      setPlacementTip(answer.placementTip);
      setCaution(answer.caution);
    }
  }, [hydrated, id, answerDrafts, consultation?.answer]);

  const productTotal = useMemo(
    () =>
      productPairs.reduce(
        (sum, pair) =>
          sum +
          (pair.product.name && Number(pair.product.price) > 0
            ? Number(pair.product.price)
            : 0),
        0,
      ),
    [productPairs],
  );

  const altTotal = useMemo(
    () =>
      productPairs.reduce(
        (sum, pair) =>
          sum +
          (pair.alternative.name && Number(pair.alternative.price) > 0
            ? Number(pair.alternative.price)
            : 0),
        0,
      ),
    [productPairs],
  );

  const hasUnsavedChanges =
    comment.trim().length > 0 ||
    productPairs.some(
      (pair) =>
        pair.product.name ||
        pair.product.price ||
        pair.product.reason ||
        pair.product.purchaseUrl ||
        pair.alternative.name ||
        pair.alternative.price ||
        pair.alternative.reason ||
        pair.alternative.purchaseUrl,
    ) ||
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

    productPairs.forEach((pair, index) => {
      const p = pair.product;
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

    for (let index = 0; index < productPairs.length; index++) {
      const p = productPairs[index].alternative;
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
    const validProducts: Product[] = productPairs
      .filter((pair) => isProductRowFilled(pair.product))
      .map((pair, i) => ({
        id: `new-${i}`,
        name: pair.product.name,
        price: Number(pair.product.price),
        image: consultation.requestForm.roomPhotos[0] ?? "",
        reason: pair.product.reason,
        purchaseUrl: pair.product.purchaseUrl,
      }));

    const validAlts: Product[] = productPairs
      .filter((pair) => isProductRowFilled(pair.alternative))
      .map((pair, i) => ({
        id: `alt-${i}`,
        name: pair.alternative.name,
        price: Number(pair.alternative.price),
        image: consultation.requestForm.roomPhotos[0] ?? "",
        reason: pair.alternative.reason,
        purchaseUrl: pair.alternative.purchaseUrl,
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
      products: productPairs.map((pair) => ({ ...pair.product })),
      alternativeProducts: productPairs.map((pair) => ({ ...pair.alternative })),
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

  const getPairSlotRows = (list: "products" | "alternatives") =>
    productPairs.map((pair) => (list === "products" ? pair.product : pair.alternative));

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
    setProductPairs((prev) => {
      const nextPairs = prev.map((pair, i) => {
        if (i !== index) return pair;
        const slot = list === "products" ? "product" : "alternative";
        const updatedRow = { ...pair[slot], [field]: value };
        return { ...pair, [slot]: updatedRow };
      });
      const updatedRow =
        list === "products" ? nextPairs[index].product : nextPairs[index].alternative;
      syncProductRowErrors(list, index, updatedRow, getPairSlotRows(list));
      return nextPairs;
    });
  };

  const openProductPicker = (list: "products" | "alternatives", index: number) => {
    setPickerTarget({ list, index });
    setProductPickerOpen(true);
  };

  const selectMockProduct = (item: (typeof MOCK_OHOUSE_PRODUCTS)[number]) => {
    if (!pickerTarget) return;
    const { list, index } = pickerTarget;
    setJustSaved(false);
    setProductPairs((prev) => {
      const existingUrls = prev.flatMap((pair) => [
        pair.product.purchaseUrl,
        pair.alternative.purchaseUrl,
      ]);
      const purchaseUrl = generateUniqueOhzipUrl(existingUrls);
      const nextPairs = prev.map((pair, i) => {
        if (i !== index) return pair;
        const slot = list === "products" ? "product" : "alternative";
        const updatedRow = {
          ...pair[slot],
          name: item.name,
          price: String(item.price),
          purchaseUrl,
        };
        return { ...pair, [slot]: updatedRow };
      });
      const updatedRow =
        list === "products" ? nextPairs[index].product : nextPairs[index].alternative;
      syncProductRowErrors(list, index, updatedRow, getPairSlotRows(list));
      return nextPairs;
    });
    setProductPickerOpen(false);
    setPickerTarget(null);
    showToast(`${item.name} 상품을 선택했어요`);
  };

  const addProductPair = () => {
    if (productPairs.length >= 10) return;
    setJustSaved(false);
    setProductPairs((prev) => [...prev, emptyPair()]);
  };

  const removeProductPair = (index: number) => {
    if (productPairs.length <= 1) return;
    setJustSaved(false);
    setProductPairs((prev) => prev.filter((_, i) => i !== index));
    setProductErrors({});
    setAltErrors({});
    setErrors((prev) => prev.filter((x) => x !== "products" && x !== "alternatives"));
  };

  const renderProductFormFields = (
    list: "products" | "alternatives",
    product: ProductForm,
    index: number,
    fieldErrs: ProductFieldErrors,
    reasonPlaceholder: string,
    title: string,
  ) => (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#111]">{title}</span>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-[#01a1ff] bg-white px-2.5 py-1 text-xs font-medium text-[#01a1ff]"
          onClick={() => openProductPicker(list, index)}
        >
          오늘의집 선택
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
    </>
  );

  const renderProductPair = (pair: ProductPairForm, index: number) => (
    <div
      key={`pair-${index}`}
      ref={(el) => {
        fieldRefs.current[`pair-${index}`] = el;
      }}
      className="mt-4 rounded-2xl border border-[#e8e8e8] bg-[#fafafa] p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#111]">상품 세트 {index + 1}</p>
          <p className="mt-0.5 text-xs text-[#999]">추천 1개 + 대체 1개</p>
        </div>
        {productPairs.length > 1 && (
          <button
            type="button"
            onClick={() => removeProductPair(index)}
            className="shrink-0 rounded-lg border border-[#ffc9c9] bg-[#fff5f5] px-2.5 py-1 text-xs font-medium text-[#e03131]"
          >
            삭제
          </button>
        )}
      </div>

      <div
        ref={(el) => {
          fieldRefs.current[`products-${index}`] = el;
        }}
        className="rounded-xl border border-[#eee] bg-white p-3"
      >
        {renderProductFormFields(
          "products",
          pair.product,
          index,
          productErrors,
          PRODUCT_REASON_PLACEHOLDER,
          "추천 상품",
        )}
      </div>

      <div
        ref={(el) => {
          fieldRefs.current[`alternatives-${index}`] = el;
        }}
        className="mt-3 rounded-xl border border-[#dbeafe] bg-[#fafcff] p-3"
      >
        {renderProductFormFields(
          "alternatives",
          pair.alternative,
          index,
          altErrors,
          ALT_REASON_PLACEHOLDER,
          "대체 상품",
        )}
      </div>
    </div>
  );

  const clearTextFieldError = (field: "comment" | "placementTip" | "caution", value: string) => {
    const isValid =
      field === "comment" ? value.trim().length > 0 : isTextFieldValid(value);
    if (errors.includes(field) && isValid) {
      setErrors((e) => e.filter((x) => x !== field));
    }
  };

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
          <div>
            <label className="text-sm font-semibold">
              추천 · 대체 상품 <span className="text-[#e03131]">*</span>
            </label>
            <p className="mt-1 text-xs text-[#999]">
              추천 1개 + 대체 1개가 한 세트 · 최대 10세트
            </p>
          </div>
          {productPairs.map((pair, index) => renderProductPair(pair, index))}
          {productPairs.length < 10 && (
            <button
              type="button"
              onClick={addProductPair}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#01a1ff] bg-[#f8fcff] py-3 text-sm font-semibold text-[#01a1ff]"
            >
              추천 상품 추가
            </button>
          )}
          {(productTotal > 0 || altTotal > 0) && (
            <div className="mt-3 space-y-1 text-sm font-semibold text-[#111]">
              {productTotal > 0 && <p>추천 합계 {formatPrice(productTotal)}</p>}
              {altTotal > 0 && <p>대체 합계 {formatPrice(altTotal)}</p>}
            </div>
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
