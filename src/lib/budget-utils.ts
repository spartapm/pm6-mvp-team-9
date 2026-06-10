import { formatPrice } from "@/lib/mock-data";

function parseManwon(value: string): number {
  const match = value.match(/(\d+)만원/);
  return match ? Number(match[1]) * 10000 : 0;
}

export function parseBudgetRange(budget: string): { min: number; max: number } {
  if (budget.includes("미만")) {
    return { min: 0, max: parseManwon(budget) };
  }
  if (budget.includes("이상")) {
    return { min: parseManwon(budget), max: Number.POSITIVE_INFINITY };
  }
  const range = budget.match(/(\d+)만원~(\d+)만원/);
  if (range) {
    return {
      min: Number(range[1]) * 10000,
      max: Number(range[2]) * 10000,
    };
  }
  return { min: 0, max: Number.POSITIVE_INFINITY };
}

export function getBudgetDiff(total: number, budget: string) {
  const { min, max } = parseBudgetRange(budget);
  const target = Number.isFinite(max) ? Math.round((min + max) / 2) : min;
  const diff = total - target;

  if (diff === 0) {
    return { diff: 0, label: "예산과 일치", tone: "neutral" as const };
  }
  if (diff > 0) {
    return { diff, label: `예산 대비 +${formatPrice(diff)}`, tone: "over" as const };
  }
  return {
    diff,
    label: `예산 대비 -${formatPrice(Math.abs(diff))}`,
    tone: "under" as const,
  };
}
