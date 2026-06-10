type MobileShellProps = {
  children: React.ReactNode;
};

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="h-screen-mobile overflow-hidden bg-white min-[391px]:bg-[#8f8f90]">
      <div
        data-mobile-frame
        className="relative mx-auto h-screen-mobile w-full max-w-[390px] overflow-hidden bg-white [transform:translateZ(0)] min-[391px]:shadow-lg"
      >
        <div
          data-mobile-scroll
          className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
          style={{
            paddingTop: "var(--safe-area-top)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
