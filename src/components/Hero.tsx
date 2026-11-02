"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import Magnetic from "./Magnetic";

type Props = {
  name: string; title: string; stack: string[]; intro: string;
  cta: string; ctaHref: string; secondary: string; secondaryHref: string;
  scroll: string; socials: { label: string; href: string }[];
};
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const Arrow = () => <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Out = () => <svg className="arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg>;

export default function Hero({ name, title, stack, intro, cta, ctaHref, secondary, secondaryHref, scroll, socials }: Props) {
  const root = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current!, c = cv.current!, g = c.getContext("2d");
    if (!g) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(pointer: fine)");
    let w = 0, h = 0, raf = 0, last = 0, visible = true, running = false;
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    let star = "255,255,255", glow = "255,150,70", light = false;
    type S = { x: number; y: number; z: number; r: number; p: number; f: number };
    type Dust = { x: number; y: number; z: number; v: number; s: number; a: number };
    let stars: S[] = [], dust: Dust[] = [];
    let sprite: HTMLCanvasElement | null = null;
    let meteor: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextMeteor = 4000 + Math.random() * 4000;

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      star = cs.getPropertyValue("--star-rgb").trim() || star;
      glow = cs.getPropertyValue("--glow-rgb").trim() || glow;
      light = document.documentElement.dataset.theme === "light";
      const s = document.createElement("canvas"); s.width = s.height = 64;
      const sg = s.getContext("2d")!, gr = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${glow},.9)`); gr.addColorStop(.35, `rgba(${glow},.25)`); gr.addColorStop(1, `rgba(${glow},0)`);
      sg.fillStyle = gr; sg.fillRect(0, 0, 64, 64); sprite = s;
    };
    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(230, (w * h) / 8500));
      stars = Array.from({ length: n }, () => { const z = Math.random(); return { x: Math.random(), y: Math.random(), z, r: 0.35 + z * 1.15, p: Math.random() * 6.28, f: 0.5 + Math.random() }; });
      dust = Array.from({ length: Math.round(n / 7) }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, v: 0.00002 + Math.random() * 0.00004, s: 10 + Math.random() * 26, a: 0.18 + Math.random() * 0.3 }));
    };
    const draw = (t: number, dt: number) => {
      g.clearRect(0, 0, w, h);
      for (const s of stars) {
        const ox = m.x * s.z * 26, oy = m.y * s.z * 18;
        const x = (((s.x * w - ox) % w) + w) % w, y = (((s.y * h - oy) % h) + h) % h;
        const tw = reduce.matches ? 1 : 0.55 + 0.45 * Math.sin(t * 0.0012 * s.f + s.p);
        g.fillStyle = `rgba(${star},${((light ? 0.28 : 0.35) + s.z * 0.5) * tw})`;
        g.beginPath(); g.arc(x, y, s.r, 0, 6.2832); g.fill();
      }
      if (sprite) for (const p of dust) {
        if (!reduce.matches) { p.y -= p.v * dt; if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); } }
        const x = p.x * w - m.x * p.z * 34, y = p.y * h - m.y * p.z * 24;
        g.globalAlpha = p.a * (light ? 0.7 : 1); g.drawImage(sprite, x - p.s, y - p.s, p.s * 2, p.s * 2);
      }
      g.globalAlpha = 1;
      if (!light && !reduce.matches) {
        nextMeteor -= dt;
        if (!meteor && nextMeteor <= 0) { meteor = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.35, vx: 0.9 + Math.random() * 0.4, vy: 0.4 + Math.random() * 0.2, life: 1 }; nextMeteor = 7000 + Math.random() * 7000; }
        if (meteor) {
          const mt = meteor; mt.x += mt.vx * dt; mt.y += mt.vy * dt; mt.life -= dt / 900;
          const gr = g.createLinearGradient(mt.x, mt.y, mt.x - mt.vx * 120, mt.y - mt.vy * 120);
          gr.addColorStop(0, `rgba(${star},${0.8 * Math.max(mt.life, 0)})`); gr.addColorStop(1, `rgba(${star},0)`);
          g.strokeStyle = gr; g.lineWidth = 1.2; g.beginPath(); g.moveTo(mt.x, mt.y); g.lineTo(mt.x - mt.vx * 120, mt.y - mt.vy * 120); g.stroke();
          if (mt.life <= 0) meteor = null;
        }
      }
    };
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      // cursor parallax: eased, written as CSS vars consumed by the orbit layers
      m.x += (m.tx - m.x) * 0.07; m.y += (m.ty - m.y) * 0.07;
      el.style.setProperty("--px", m.x.toFixed(3)); el.style.setProperty("--py", m.y.toFixed(3));
      const dt = t - last;
      if (dt >= 32) { last = t; draw(t, Math.min(dt, 80)); } // canvas capped at ~30fps
    };
    const start = () => { if (running || reduce.matches) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const onMove = (e: PointerEvent) => { if (!fine.matches || reduce.matches) return; m.tx = (e.clientX / innerWidth - 0.5) * 2; m.ty = (e.clientY / innerHeight - 0.5) * 2; };
    const onLeave = () => { m.tx = 0; m.ty = 0; };
    const onResize = () => { build(); if (reduce.matches) draw(0, 0); };
    const onMotion = () => { stop(); if (reduce.matches) { el.style.setProperty("--px", "0"); el.style.setProperty("--py", "0"); draw(0, 0); } else start(); };

    readTheme(); build(); draw(0, 0); start();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }); io.observe(el);
    const mo = new MutationObserver(() => { readTheme(); if (reduce.matches) draw(0, 0); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    addEventListener("pointermove", onMove, { passive: true }); el.addEventListener("pointerleave", onLeave);
    addEventListener("resize", onResize); reduce.addEventListener("change", onMotion);
    return () => { stop(); io.disconnect(); mo.disconnect(); removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); removeEventListener("resize", onResize); reduce.removeEventListener("change", onMotion); };
  }, []);

  const words = name.split(/\s+/).filter(Boolean);
  return (
    <section ref={root} id="hero" className="hero" aria-labelledby="hero-title">
      <canvas ref={cv} className="hero-canvas" aria-hidden />
      <div className="hero-glow" aria-hidden />
      <div className="hero-orbits" aria-hidden>
        <div className="orb-layer orb-far">
          <div className="plane"><i className="ring dash r4"><b className="pl" style={{ "--s": "7px", "--t": "150s" } as CSSProperties} /></i></div>
        </div>
        <div className="orb-layer">
          <div className="halo" />
          <div className="plane">
            <i className="ring r3"><b className="pl" style={{ "--s": "12px", "--t": "96s" } as CSSProperties} /></i>
            <i className="ring arc r2"><b className="pl warm" style={{ "--s": "9px", "--t": "58s" } as CSSProperties} /></i>
            <i className="ring r1"><b className="pl" style={{ "--s": "16px", "--t": "34s" } as CSSProperties} /></i>
          </div>
          <div className="sun" />
        </div>
      </div>
      <div className="hero-vignette" aria-hidden />

      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker hero-in" style={d(0.1)}><span className="dot" />{title}</p>
          <h1 id="hero-title" className="display hero-name" aria-label={name}>
            {words.map((wd, i) => (
              <span key={i} className="mask" aria-hidden><span className="word" style={d(0.25 + i * 0.14)}>{wd}</span></span>
            ))}
          </h1>
          {stack.length > 0 && <ul className="hero-stack hero-in" style={d(0.7)}>{stack.map((s) => <li key={s}>{s}</li>)}</ul>}
          <p className="lead hero-in" style={d(0.85)}>{intro}</p>
          <div className="hero-cta hero-in" style={d(1)}>
            <Magnetic><a href={ctaHref} className="btn">{cta}<Arrow /></a></Magnetic>
            <a href={secondaryHref} className="btn ghost">{secondary}</a>
          </div>
          <ul className="hero-social hero-in" style={d(1.15)}>
            {socials.map((s) => <li key={s.label}><a className="link-u" href={s.href} {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{s.label}<Out /></a></li>)}
          </ul>
        </div>
      </div>

      <a href="#about" className="scroll-cue eyebrow" aria-label={scroll}><span>{scroll}</span><i className="track" /></a>
    </section>
  );
}
