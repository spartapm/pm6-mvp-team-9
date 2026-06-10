"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import ConsultationCard from "@/components/consultations/ConsultationCard";
import ConsultationCardSkeleton from "@/components/consultations/ConsultationCardSkeleton";
import ErrorRetry from "@/components/ui/ErrorRetry";
import { useApp } from "@/context/AppContext";
import { fetchConsultations } from "@/lib/api/mock-fetch";

function CreatorConsultationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { creatorConsultations, showToast } = useApp();
  const [tab, setTab] = useState<"waiting" | "done">(
    searchParams.get("tab") === "done" ? "done" : "waiting",
  );
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [retryCount, setRetryCount] = useState(0);

  const expandParam = searchParams.get("expand") ?? searchParams.get("id");

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

  useEffect(() => {
    if (!expandParam || loadState !== "ready") return;
    const target = creatorConsultations.find((c) => c.id === expandParam);
    if (!target) return;
    setTab(target.status === "WAITING" ? "waiting" : "done");
    setExpandedIds((prev) => new Set(prev).add(target.id));
  }, [expandParam, creatorConsultations, loadState]);

  const waiting = useMemo(
    () => creatorConsultations.filter((c) => c.status === "WAITING"),
    [creatorConsultations],
  );
  const done = useMemo(
    () => creatorConsultations.filter((c) => c.status !== "WAITING"),
    [creatorConsultations],
  );

  const filtered = useMemo(() => {
    const list = tab === "waiting" ? waiting : done;
    return [...list].sort((a, b) => {
      const da = tab === "done" ? (a.submittedAt ?? a.requestedAt) : a.requestedAt;
      const db = tab === "done" ? (b.submittedAt ?? b.requestedAt) : b.requestedAt;
      return sort === "latest" ? db.localeCompare(da) : da.localeCompare(db);
    });
  }, [waiting, done, tab, sort]);

  const handleTabChange = (nextTab: "waiting" | "done") => {
    setTab(nextTab);
    setSort("latest");
  };

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-full bg-[#f5f5f5] pb-nav">
      <PageHeader title="공간상담 상담내역" border />

      <div className="flex border-b border-[#eee] bg-white">
        <button
          type="button"
          onClick={() => handleTabChange("waiting")}
          className={`w-1/2 py-3.5 text-[15px] font-semibold ${
            tab === "waiting"
              ? "border-b-2 border-[#01a1ff] text-[#01a1ff]"
              : "text-[#999]"
          }`}
        >
          답변대기 {waiting.length}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("done")}
          className={`w-1/2 py-3.5 text-[15px] font-semibold ${
            tab === "done"
              ? "border-b-2 border-[#01a1ff] text-[#01a1ff]"
              : "text-[#999]"
          }`}
        >
          답변완료 {done.length}
        </button>
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
            {tab === "waiting" ? "신청한 상담이 없어요" : "처리한 답변이 없어요"}
          </p>
        ) : (
          filtered.map((c) => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              mode="creator"
              expanded={expandedIds.has(c.id)}
              onToggle={() => handleToggle(c.id)}
              onWriteAnswer={() =>
                router.push(`/creator/consultations/${c.id}/write`)
              }
              onEditAnswer={() =>
                router.push(`/creator/consultations/${c.id}/write`)
              }
              onEditBlocked={() =>
                showToast("구매자가 확인한 견적은 수정할 수 없어요")
              }
            />
          ))
        )}
      </div>

      <BottomNav activeOverride="/mypage" />
    </div>
  );
}

export default function CreatorConsultationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-[#f5f5f5] pb-nav">
          <PageHeader title="공간상담 상담내역" border />
          <ConsultationCardSkeleton />
          <ConsultationCardSkeleton />
        </div>
      }
    >
      <CreatorConsultationsContent />
    </Suspense>
  );
}
