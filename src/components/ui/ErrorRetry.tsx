type ErrorRetryProps = {
  message: string;
  onRetry: () => void;
  compact?: boolean;
};

export default function ErrorRetry({ message, onRetry, compact }: ErrorRetryProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-8" : "py-16"}`}
    >
      <p className="text-sm leading-6 text-[#666]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-[#01a1ff] px-6 py-2.5 text-sm font-semibold text-white"
      >
        새로고침
      </button>
    </div>
  );
}
