export const MOBILE_FRAME_SELECTOR = "[data-mobile-frame]";
export const MOBILE_SCROLL_SELECTOR = "[data-mobile-scroll]";

export function getMobileFrame(): HTMLElement | null {
  return document.querySelector(MOBILE_FRAME_SELECTOR);
}

export function getMobileScrollContainer(): HTMLElement | null {
  return document.querySelector(MOBILE_SCROLL_SELECTOR);
}
