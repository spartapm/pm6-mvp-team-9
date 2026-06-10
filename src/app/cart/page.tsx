"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="block min-h-full w-full cursor-pointer bg-white p-0 text-left"
      aria-label="장바구니 — 탭하면 이전 화면으로 돌아갑니다"
    >
      <Image
        src="/images/cart-page.png"
        alt="장바구니"
        width={390}
        height={844}
        className="h-auto w-full"
        priority
      />
    </button>
  );
}
