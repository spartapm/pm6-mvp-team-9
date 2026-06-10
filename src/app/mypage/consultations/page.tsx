"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ConsultationTopBar from "@/components/consultations/ConsultationTopBar";
import PageHeader from "@/components/layout/PageHeader";
import BottomNav from "@/components/layout/BottomNav";
import ConsultationCard from "@/components/consultations/ConsultationCard";
import ConsultationCardSkeleton from "@/components/consultations/ConsultationCardSkeleton";
import ErrorRetry from "@/components/ui/ErrorRetry";
import BottomSheet from "@/components/ui/BottomSheet";
import { useApp } from "@/context/AppContext";
import { fetchConsultations } from "@/lib/api/mock-fetch";

export default function BuyerConsultationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buyerConsultations, markConsultationRead, addToCart } = useApp();
  const [tab, setTab] = useState<"waiting" | "done">(
    searchParams.get("tab") === "done" ? "done" : "waiting",
  );
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [evalModal, setEvalModal] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    fetchConsultations({ retry: retryCount > 0 })
      .then(() => {
        if (!cancelled) setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const waitingCount = useMemo(
    () => buyerConsultations.filter((c) => c.status === "WAITING").length,
    [buyerConsultations],
  );
  const doneCount = useMemo(
    () => buyerConsultations.filter((c) => c.status !== "WAITING").length,
    [buyerConsultations],
  );

  const filtered = useMemo(() => {
    let list = buyerConsultations.filter((c) =>
      tab === "waiting" ? c.status === "WAITING" : c.status !== "WAITING",
    );
    list = [...list].sort((a, b) => {
      const da = tab === "done" ? (a.submittedAt ?? a.requestedAt) : a.requestedAt;
      const db = tab === "done" ? (b.submittedAt ?? b.requestedAt) : b.requestedAt;
      return sort === "latest" ? db.localeCompare(da) : da.localeCompare(db);
    });
    return list;
  }, [buyerConsultations, tab, sort]);

  const unreadDone = useMemo(
    () => filtered.filter((c) => !c.isRead),
    [filtered],
  );
  const readDone = useMemo(
    () => filtered.filter((c) => c.isRead),
    [filtered],
  );

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    const c = buyerConsultations.find((x) => x.id === id);
    if (c && c.status !== "WAITING") markConsultationRead(id);
  };

  const handleTabChange = (next: "waiting" | "done") => {
    setTab(next);
    setExpandedIds(new Set());
  };

  return (
    <div className="min-h-full bg-[#f5f5f5] pb-nav">
      <ConsultationTopBar />
      <PageHeader title="오!공간상담 신청내역" border />

      <div className="flex border-b border-[#eee] bg-white">
        {(["waiting", "done"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={`flex-1 py-3.5 text-[15px] font-semibold ${
              tab === t ? "border-b-2 border-[#01a1ff] text-[#01a1ff]" : "text-[#999]"
            }`}
          >
            {t === "waiting" ? `답변대기 ${waitingCount}` : `답변완료 ${doneCount}`}
          </button>
        ))}
      </div>

      <div className="bg-white px-safe py-3">
        <div className="relative inline-block">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "latest" | "oldest")}
            className="appearance-none rounded-md border border-[#e0e0e0] bg-white py-1.5 pl-3 pr-8 text-sm text-[#333]"
          >
            <option value="latest">
              {tab === "done" ? "최근답변순" : "최근신청순"}
            </option>
            <option value="oldest">
              {tab === "done" ? "과거답변순" : "과거신청순"}
            </option>
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#999]">
            ▾
          </span>
        </div>
      </div>

      {loadState === "error" && (
        <div className="bg-white">
          <ErrorRetry
            message="일시적인 오류가 발생했어요. 다시 시도해주세요."
            onRetry={() => setRetryCount((c) => c + 1)}
            compact
          />
        </div>
      )}

      <div className="pb-4 pt-1">
        {loadState === "loading" ? (
          <>
            <ConsultationCardSkeleton />
            <ConsultationCardSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#999]">
            {tab === "waiting" ? "신청한 상담이 없어요" : "답변 완료 내역이 없어요"}
          </p>
        ) : tab === "done" ? (
          <>
            {unreadDone.map((c) => (
              <ConsultationCard
                key={c.id}
                consultation={c}
                mode="buyer"
                expanded={expandedIds.has(c.id)}
                onToggle={() => handleToggle(c.id)}
                onEvaluate={() => setEvalModal(c.id)}
                onAddToCart={(selectedIds) => {
                  const products =
                    c.answer?.products.filter((p) => selectedIds.includes(p.id)) ?? [];
                  addToCart(products);
                  router.push("/cart");
                }}
              />
            ))}
            {unreadDone.length > 0 && readDone.length > 0 && (
              <div className="my-4 flex items-center gap-3 px-4">
                <div className="h-px flex-1 bg-[#ddd]" />
                <span className="text-xs text-[#999]">읽음</span>
                <div className="h-px flex-1 bg-[#ddd]" />
              </div>
            )}
            {readDone.map((c) => (
              <ConsultationCard
                key={c.id}
                consultation={c}
                mode="buyer"
                expanded={expandedIds.has(c.id)}
                onToggle={() => handleToggle(c.id)}
                onEvaluate={() => setEvalModal(c.id)}
                onAddToCart={(selectedIds) => {
                  const products =
                    c.answer?.products.filter((p) => selectedIds.includes(p.id)) ?? [];
                  addToCart(products);
                  router.push("/cart");
                }}
              />
            ))}
          </>
        ) : (
          filtered.map((c) => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              mode="buyer"
              expanded={expandedIds.has(c.id)}
              onToggle={() => handleToggle(c.id)}
              onEvaluate={() => setEvalModal(c.id)}
              onAddToCart={(selectedIds) => {
                const products =
                  c.answer?.products.filter((p) => selectedIds.includes(p.id)) ?? [];
                addToCart(products);
                router.push("/cart");
              }}
            />
          ))
        )}
      </div>

      <BottomNav activeOverride="/" activeStyle="black" />

      <BottomSheet
        open={!!evalModal}
        onClose={() => setEvalModal(null)}
        closeOnBackdropClick={false}
      >
        <div className="px-5 pb-10 pt-1 text-center">
          <p className="text-base font-bold text-[#111]">상담이 만족스러우셨나요?</p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                router.push(
                  `/mypage/consultations/review/${evalModal}?satisfaction=positive`,
                );
                setEvalModal(null);
              }}
              className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e0e0e0] bg-white text-sm font-medium text-[#111]"
            >
              <span className="text-lg leading-none" aria-hidden>
                😊
              </span>
              만족해요
            </button>
            <button
              type="button"
              onClick={() => {
                router.push(
                  `/mypage/consultations/review/${evalModal}?satisfaction=negative`,
                );
                setEvalModal(null);
              }}
              className="flex h-14 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e0e0e0] bg-white text-sm font-medium text-[#111]"
            >
              <span className="text-lg leading-none" aria-hidden>
                🥲
              </span>
              아쉬워요
            </button>
          </div>
        </div>
      </BottomSheet>

    </div>
  );
}
