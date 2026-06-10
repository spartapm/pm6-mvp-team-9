"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import CreatorCard from "@/components/creators/CreatorCard";
import CreatorCardSkeleton from "@/components/creators/CreatorCardSkeleton";
import FilterBottomSheet from "@/components/creators/FilterBottomSheet";
import ErrorRetry from "@/components/ui/ErrorRetry";
import { useApp } from "@/context/AppContext";
import { fetchCreatorList } from "@/lib/api/mock-fetch";
import { SORT_LABELS } from "@/lib/constants";
import type { Creator, FilterState } from "@/lib/types";

const DEFAULT_FILTER: FilterState = {
  sort: "consult",
  styles: [],
  spaceTypes: [],
  excludeClosed: false,
};

function cloneFilter(filter: FilterState): FilterState {
  return {
    ...filter,
    styles: [...filter.styles],
    spaceTypes: [...filter.spaceTypes],
  };
}

type FilterChipKey = "sort" | "style" | "space";

const FILTER_CHIP_LABELS: Record<FilterChipKey, string> = {
  sort: "정렬",
  style: "스타일",
  space: "공간 유형",
};

type ActiveFilterTag = {
  id: string;
  label: string;
  onRemove: () => void;
};

function buildActiveFilterTags(
  filter: FilterState,
  setFilter: ReturnType<typeof useApp>["setFilter"],
): ActiveFilterTag[] {
  const tags: ActiveFilterTag[] = [
    {
      id: "sort",
      label: SORT_LABELS[filter.sort],
      onRemove: () => setFilter({ sort: "consult" }),
    },
  ];

  filter.styles.forEach((style) => {
    tags.push({
      id: `style-${style}`,
      label: style,
      onRemove: () =>
        setFilter({ styles: filter.styles.filter((item) => item !== style) }),
    });
  });

  filter.spaceTypes.forEach((space) => {
    tags.push({
      id: `space-${space}`,
      label: space,
      onRemove: () =>
        setFilter({ spaceTypes: filter.spaceTypes.filter((item) => item !== space) }),
    });
  });

  if (filter.excludeClosed) {
    tags.push({
      id: "excludeClosed",
      label: "마감 제외",
      onRemove: () => setFilter({ excludeClosed: false }),
    });
  }

  return tags;
}

function hasActiveFiltersForChip(key: FilterChipKey, filter: FilterState) {
  if (key === "sort") return filter.sort !== "consult" || filter.excludeClosed;
  if (key === "style") return filter.styles.length > 0;
  return filter.spaceTypes.length > 0;
}

function filterCreators(
  creators: Creator[],
  search: string,
  filter: ReturnType<typeof useApp>["filter"],
) {
  let result = [...creators];

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (filter.excludeClosed) {
    result = result.filter((c) => c.capacity < c.maxCapacity);
  }

  if (filter.styles.length) {
    result = result.filter((c) =>
      filter.styles.some((s) => c.styles.includes(s)),
    );
  }

  if (filter.spaceTypes.length) {
    result = result.filter((c) =>
      filter.spaceTypes.some(
        (s) =>
          c.spaceTypes.includes(s) ||
          c.tags.some((t) => t.includes(s.replace("평", ""))),
      ),
    );
  }

  result.sort((a, b) => {
    if (filter.sort === "rating") return b.rating - a.rating;
    if (filter.sort === "review") return b.reviewCount - a.reviewCount;
    return b.consultCount - a.consultCount;
  });

  return result;
}

export default function CreatorsPage() {
  const { creators, filter, setFilter, resetFilter } = useApp();
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<"sort" | "style" | "space">("sort");
  const [draftFilter, setDraftFilter] = useState<FilterState>(() => cloneFilter(filter));
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [retryCount, setRetryCount] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    fetchCreatorList({ retry: retryCount > 0 })
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

  const filtered = useMemo(
    () => filterCreators(creators, search, filter),
    [creators, search, filter],
  );

  const draftFiltered = useMemo(
    () => filterCreators(creators, search, draftFilter),
    [creators, search, draftFilter],
  );

  const openSheet = (tab: FilterChipKey) => {
    setDraftFilter(cloneFilter(filter));
    setSheetTab(tab);
    setSheetOpen(true);
  };

  const closeSheet = () => setSheetOpen(false);

  const applyDraftFilter = () => {
    setFilter({
      sort: draftFilter.sort,
      styles: draftFilter.styles,
      spaceTypes: draftFilter.spaceTypes,
      excludeClosed: draftFilter.excludeClosed,
    });
    setSheetOpen(false);
  };

  const activeFilterTags = buildActiveFilterTags(filter, setFilter);

  const hasCachedCreators = creators.length > 0;
  const showList =
    loadState === "ready" || (loadState === "error" && hasCachedCreators);

  return (
    <div className="min-h-full bg-white pb-nav">
      <PageHeader title="오!공간상담" border={false} />

      <div className="flex border-b border-[#eee]">
        <span className="flex-1 border-b-2 border-[#01a1ff] py-3 text-center text-[15px] font-semibold text-[#01a1ff]">
          크리에이터 목록
        </span>
        <Link
          href="/event"
          className="flex-1 py-3 text-center text-[15px] font-semibold text-black"
        >
          이벤트
        </Link>
      </div>

      <div className="px-4 pt-5">
        <h2 className="text-[22px] font-normal leading-8 text-[#111]">
          당신의 공간을
          <br />
          함께 꾸며줄 크리에이터를 만나보세요
        </h2>

        <div className="relative mt-5">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]">
            🔍
          </span>
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value.slice(0, 50))}
            placeholder="공간, 스타일, 키워드로 검색"
            className="h-11 w-full rounded-lg bg-[#f5f5f5] pl-10 pr-3 text-sm text-black outline-none placeholder:text-[#999]"
          />
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["sort", "style", "space"] as const).map((key) => {
                const isSheetActive = sheetOpen && sheetTab === key;
                const hasActiveFilter = hasActiveFiltersForChip(key, filter);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => openSheet(key)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
                      isSheetActive || hasActiveFilter
                        ? "border-[#01a1ff] bg-[#f0f9ff] font-medium text-[#01a1ff]"
                        : "border-[#ddd] text-[#555]"
                    }`}
                  >
                    {FILTER_CHIP_LABELS[key]} ∨
                  </button>
                );
              })}
            </div>
            <label className="flex shrink-0 items-center gap-1.5 text-xs text-[#434343]">
              <input
                type="checkbox"
                checked={filter.excludeClosed}
                onChange={(e) => setFilter({ excludeClosed: e.target.checked })}
                className="accent-[#01a1ff]"
              />
              마감 제외
            </label>
          </div>

          {activeFilterTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {activeFilterTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded bg-[#f5f5f5] px-2 py-1 text-xs text-[#8c8c8c]"
                >
                  {tag.label}
                  <button
                    type="button"
                    onClick={tag.onRemove}
                    aria-label={`${tag.label} 필터 제거`}
                    className="leading-none text-[#8c8c8c]"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {loadState === "error" && (
        <div className="mx-4 mt-2 rounded-xl bg-[#fff5f5] px-4 py-3">
          <p className="text-sm text-[#666]">크리에이터 목록을 불러오지 못했어요</p>
          <button
            type="button"
            onClick={() => setRetryCount((c) => c + 1)}
            className="mt-2 text-sm font-semibold text-[#01a1ff]"
          >
            다시 시도
          </button>
        </div>
      )}

      <div className="mt-1">
        {loadState === "loading" &&
          Array.from({ length: 4 }).map((_, i) => <CreatorCardSkeleton key={i} />)}

        {loadState === "error" && !hasCachedCreators && (
          <ErrorRetry
            message="크리에이터 목록을 불러오지 못했어요"
            onRetry={() => setRetryCount((c) => c + 1)}
          />
        )}

        {showList && filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[#666]">조건에 맞는 크리에이터가 없어요</p>
            <button
              type="button"
              onClick={() => {
                resetFilter();
                setSearch("");
              }}
              className="mt-4 rounded-xl border border-[#ddd] px-6 py-2 text-sm"
            >
              필터 초기화
            </button>
          </div>
        )}

        {showList &&
          filtered.map((creator) => <CreatorCard key={creator.id} creator={creator} />)}
      </div>

      <FilterBottomSheet
        open={sheetOpen}
        tab={sheetTab}
        filter={draftFilter}
        resultCount={draftFiltered.length}
        onClose={closeSheet}
        onTabChange={setSheetTab}
        onChange={(partial) => setDraftFilter((prev) => ({ ...prev, ...partial }))}
        onReset={() => setDraftFilter(cloneFilter(DEFAULT_FILTER))}
        onApply={applyDraftFilter}
      />

      <BottomNav activeOverride="/event" />
    </div>
  );
}
