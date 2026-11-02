"use client";
import { useEffect, useRef, type CSSProperties } from "react";

export type TLItem = { company: string; role: string; period: string; bullets: string[] };

/** Experience timeline: the accent line fills with scroll progress; entries light up as they pass mid-screen. */
export default function Timeline({ items }: { items: TLItem[] }) {
  const ol = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ol.current!;
    const lis = Array.from(el.querySelectorAll<HTMLElement>(".tl-item"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), mid = innerHeight * 0.62;
      el.style.setProperty("--p", String(reduce ? 1 : Math.max(0, Math.min(1, (mid - r.top) / r.height))));
      for (const li of lis) li.dataset.on = String(reduce || li.getBoundingClientRect().top < mid);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <ol ref={ol} className="tl" style={{ "--p": 0 } as CSSProperties}>
      <div className="tl-line" aria-hidden><div className="tl-fill" /></div>
      {items.map((e) => (
        <li key={e.company + e.period} className="tl-item" data-on="false">
          <span className="tl-dot" aria-hidden />
          <div className="tl-body">
            <div>
              <h3 className="display tl-co">{e.company}</h3>
              <p className="tl-role">{e.role}</p>
              <span className="chip">{e.period}</span>
            </div>
            <ul className="tl-list">{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
