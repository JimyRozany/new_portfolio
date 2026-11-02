"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

type Item = { id: string; label: string };
type Props = { l: "ar" | "en"; name: string; items: Item[]; themeLabel: string; menuLabel: string; closeLabel: string; progressLabel: string };

export default function Nav({ l, name, items, themeLabel, menuLabel, closeLabel, progressLabel }: Props) {
  const pathname = usePathname() ?? `/${l}`;
  const home = pathname === `/${l}` || pathname === `/${l}/`;
  const other = l === "ar" ? "en" : "ar";
  const switchHref = `/${other}${pathname.replace(/^\/(ar|en)/, "")}`;
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  // scroll state + reading progress (rAF-throttled, writes transform directly)
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
        setScrolled((s) => (y > 24 === s ? s : y > 24));
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      });
    };
    on(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [pathname]);

  // active-section indicator (home page only)
  useEffect(() => {
    if (!home) { setActive(""); return; }
    const ids = ["hero", ...items.map((i) => i.id)];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setActive(e.target.id === "hero" ? "" : e.target.id); }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [home, items, pathname]);

  // mobile menu: lock scroll, close on Escape / route change
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className="nav" data-scrolled={scrolled}>
        <div className="wrap nav-in">
          <Link href={`/${l}`} className="logo" onClick={() => setOpen(false)}><span className="logo-mark" aria-hidden />{name}</Link>
          <nav aria-label="main" className="nav-links">
            {items.map((i) => <Link key={i.id} href={`/${l}#${i.id}`} className="nav-link" data-active={active === i.id}>{i.label}</Link>)}
          </nav>
          <div className="nav-tools">
            <Link className="icon-btn" hrefLang={other} lang={other} href={switchHref} aria-label={other === "ar" ? "العربية" : "English"}>{other === "ar" ? "ع" : "EN"}</Link>
            <ThemeToggle label={themeLabel} />
            <button type="button" className="icon-btn burger" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? closeLabel : menuLabel} onClick={() => setOpen((o) => !o)}><i /><i /></button>
          </div>
        </div>
        <div ref={bar} className="progress" role="progressbar" aria-label={progressLabel} />
      </header>
      <div id="mobile-menu" className="menu" data-open={open}>
        {items.map((i, n) => <Link key={i.id} href={`/${l}#${i.id}`} style={{ "--i": n } as React.CSSProperties} onClick={() => setOpen(false)}><span>0{n + 1}</span>{i.label}</Link>)}
      </div>
    </>
  );
}
