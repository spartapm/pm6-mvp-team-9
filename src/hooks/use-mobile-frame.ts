"use client";

import { useEffect, useState } from "react";
import { getMobileFrame } from "@/lib/mobile-scroll";

export function useMobileFrame() {
  const [frame, setFrame] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setFrame(getMobileFrame());
  }, []);

  return frame;
}
