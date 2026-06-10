"use client";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
};

export default function Modal({
  open,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-8">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-[min(320px,calc(100vw-2rem))] rounded-2xl bg-white p-5 sm:p-6 shadow-xl">
        <h2 className="text-center text-lg font-bold text-black">{title}</h2>
        {description && (
          <p className="mt-3 text-center text-sm leading-6 text-[#666]">{description}</p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPrimary}
            className="h-12 rounded-xl bg-[#01a1ff] text-sm font-semibold text-white"
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={onSecondary}
            className="h-12 rounded-xl border border-[#ddd] text-sm font-medium text-[#333]"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
