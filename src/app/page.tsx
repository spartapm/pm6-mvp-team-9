export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-white px-6 py-16 text-center">
      <p className="text-sm font-medium text-neutral-500">group9 MVP</p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
        모바일 뷰로 시작합니다
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-600">
        데스크탑에서도 390px 모바일 프레임 안에서 미리볼 수 있습니다.
      </p>
    </div>
  );
}
