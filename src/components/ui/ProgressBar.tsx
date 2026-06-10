type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / (total + 1)) * 100);

  return (
    <div className="sticky top-0 z-30 bg-white">
      <div className="h-1.5 w-full bg-[#eee]">
        <div
          className="h-full bg-[#01a1ff] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
