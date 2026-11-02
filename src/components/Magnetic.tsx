"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Subtle magnetic pull toward the cursor. Fine pointers only; off with reduced motion. */
export default function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    };
    const reset = () => { el.style.transform = ""; };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", reset);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", reset); };
  }, [strength]);
  return <span ref={ref} className="mag">{children}</span>;
}
