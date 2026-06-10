"use client";

import { FILTER_SPACE_TYPES, FILTER_STYLES, SORT_LABELS } from "@/lib/constants";
import type { FilterState } from "@/lib/types";
import BottomSheet from "@/components/ui/BottomSheet";

type FilterBottomSheetProps = {
  open: boolean;
  tab: "sort" | "style" | "space";
  filter: FilterState;
  resultCount: number;
  onClose: () => void;
  onTabChange: (tab: "sort" | "style" | "space") => void;
  onChange: (filter: Partial<FilterState>) => void;
  onReset: () => void;
  onApply: () => void;
};

export default function FilterBottomSheet({
  open,
  tab,
  filter,
  resultCount,
  onClose,
  onTabChange,
  onChange,
  onReset,
  onApply,
}: FilterBottomSheetProps) {
  const tabs = [
    { id: "sort" as const, label: "정렬" },
    { id: "style" as const, label: "스타일" },
    { id: "space" as const, label: "공간 유형" },
  ];

  const toggleArray = (key: "styles" | "spaceTypes", value: string) => {
    const arr = filter[key];
    onChange({
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-4 pb-6">
        <div className="mb-4 flex border-b border-[#eee]">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`flex-1 py-3 text-sm font-medium ${
                tab === t.id
                  ? "border-b-2 border-[#01a1ff] text-[#01a1ff]"
                  : "text-[#666]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "sort" && (
          <div className="space-y-3">
            {(Object.keys(SORT_LABELS) as Array<keyof typeof SORT_LABELS>).map((key) => (
              <label key={key} className="flex items-center gap-3 py-1">
                <input
                  type="radio"
                  name="sort"
                  checked={filter.sort === key}
                  onChange={() => onChange({ sort: key as FilterState["sort"] })}
                  className="h-4 w-4 accent-[#01a1ff]"
                />
                <span className="text-sm text-[#333]">{SORT_LABELS[key]}</span>
              </label>
            ))}
            <label className="mt-4 flex items-center gap-2 border-t border-[#eee] pt-4">
              <input
                type="checkbox"
                checked={filter.excludeClosed}
                onChange={(e) => onChange({ excludeClosed: e.target.checked })}
                className="h-4 w-4 accent-[#01a1ff]"
              />
              <span className="text-sm text-[#434343]">마감 제외</span>
            </label>
          </div>
        )}

        {tab === "style" && (
          <div className="space-y-2">
            {FILTER_STYLES.map((style) => (
              <label key={style} className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  checked={filter.styles.includes(style)}
                  onChange={() => toggleArray("styles", style)}
                  className="h-4 w-4 accent-[#01a1ff]"
                />
                <span className="text-sm text-[#333]">{style}</span>
              </label>
            ))}
          </div>
        )}

        {tab === "space" && (
          <div className="space-y-2">
            {FILTER_SPACE_TYPES.map((space) => (
              <label key={space} className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  checked={filter.spaceTypes.includes(space)}
                  onChange={() => toggleArray("spaceTypes", space)}
                  className="h-4 w-4 accent-[#01a1ff]"
                />
                <span className="text-sm text-[#333]">{space}</span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-[#ddd] text-sm text-[#666]"
          >
            ↺ 초기화
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={resultCount === 0}
            className="h-12 flex-[2] rounded-xl bg-[#01a1ff] text-sm font-semibold text-white disabled:bg-[#ccc]"
          >
            {resultCount === 0
              ? "조건에 맞는 크리에이터가 없어요"
              : `${resultCount}명 크리에이터보기`}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
