"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Tag = "div" | "li" | "section" | "article" | "p" | "h2" | "dl";

/** Scroll-triggered reveal. Adds .in once (no re-render). Content stays visible without JS (.js gate in CSS). */
export default function Reveal({ children, as = "div", delay = 0, className = "" }: { children: ReactNode; as?: Tag; delay?: number; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("in"); return; }
    const io = new IntersectionObserver(
      (es) => { for (const e of es) if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add("in"); io.unobserve(e.target); } },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Comp = as as "div";
  return <Comp ref={ref as React.RefObject<HTMLDivElement>} className={`rv ${className}`} style={{ "--d": `${delay}s` } as CSSProperties}>{children}</Comp>;
}
