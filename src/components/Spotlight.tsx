"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Card shell: scroll-reveal + cursor-following light. Writes CSS vars / classes only (no re-render). */
export default function Spotlight({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("in"); return; }
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting || es[0].boundingClientRect.top < 0) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <article
      ref={ref}
      className={`rv ${className}`}
      style={{ "--d": `${delay}s` } as CSSProperties}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >{children}</article>
  );
}
