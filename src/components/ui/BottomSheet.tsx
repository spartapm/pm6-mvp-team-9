"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** 시트 하단이 화면 아래에서 이만큼 위에 오면 닫힘 */
const DISMISS_VISIBLE_MARGIN = 48;
const VELOCITY_DISMISS = 0.6;
const CLOSE_ANIMATION_MS = 200;

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  closeOnBackdropClick?: boolean;
};

export default function BottomSheet({
  open,
  onClose,
  children,
  title,
  closeOnBackdropClick = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragYRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ pointerY: 0, dragY: 0, lastY: 0, lastT: 0 });
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const setDrag = useCallback((y: number) => {
    dragYRef.current = y;
    setDragY(y);
  }, []);

  useEffect(() => {
    if (open) {
      setDrag(0);
      draggingRef.current = false;
      setIsDragging(false);
    }
  }, [open, setDrag]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const animateClose = useCallback(() => {
    const height = sheetRef.current?.offsetHeight ?? 400;
    setDrag(height);
    window.setTimeout(onClose, CLOSE_ANIMATION_MS);
  }, [onClose, setDrag]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      pointerY: e.clientY,
      dragY: dragYRef.current,
      lastY: e.clientY,
      lastT: Date.now(),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = e.clientY - dragStartRef.current.pointerY;
    setDrag(Math.max(0, dragStartRef.current.dragY + delta));
    dragStartRef.current.lastY = e.clientY;
    dragStartRef.current.lastT = Date.now();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    draggingRef.current = false;
    setIsDragging(false);

    const sheetHeight = sheetRef.current?.offsetHeight ?? 0;
    const currentDrag = dragYRef.current;
    const dt = Math.max(Date.now() - dragStartRef.current.lastT, 1);
    const velocity = (e.clientY - dragStartRef.current.lastY) / dt;
    const dismissThreshold = Math.max(
      sheetHeight - DISMISS_VISIBLE_MARGIN,
      sheetHeight * 0.25,
    );

    if (currentDrag >= dismissThreshold || velocity > VELOCITY_DISMISS) {
      animateClose();
    } else {
      setDrag(0);
    }
  };

  if (!open) return null;

  const sheetHeight = sheetRef.current?.offsetHeight ?? 1;
  const backdropOpacity = Math.max(0, 0.4 * (1 - dragY / sheetHeight));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 transition-opacity duration-200"
        style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-label="닫기"
      />
      <div
        ref={sheetRef}
        className={`mobile-shell-frame relative z-10 max-h-sheet w-full overflow-hidden rounded-t-2xl bg-white ${
          isDragging ? "" : "transition-transform duration-200 ease-out"
        }`}
        style={{ transform: `translateY(${dragY}px)` }}
      >
        <div
          className="flex touch-none cursor-grab justify-center py-3 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-hidden
        >
          <div className="h-1 w-10 rounded-full bg-[#ddd]" />
        </div>
        {title && (
          <h3 className="px-5 pb-3 text-base font-semibold text-black">{title}</h3>
        )}
        <div className="max-h-[calc(85dvh-60px)] overflow-y-auto overscroll-y-contain pb-[var(--safe-area-bottom)]">
          {children}
        </div>
      </div>
    </div>
  );
}
