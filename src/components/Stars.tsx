"use client";
import { useEffect, useRef } from "react";
export default function Stars() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0;
    const size = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    size(); addEventListener("resize", size);
    const n = innerWidth < 640 ? 60 : 140;
    const s = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + .3, v: Math.random() * .00006 + .00002, p: Math.random() * 6 }));
    const draw = (t: number) => {
      g.clearRect(0, 0, w, h);
      const dark = document.documentElement.dataset.theme !== "light";
      g.fillStyle = dark ? "#fff" : "#5b4bff";
      for (const o of s) {
        if (!still) o.y = (o.y + o.v) % 1;
        g.globalAlpha = dark ? .35 + .65 * Math.abs(Math.sin(t / 1500 + o.p)) : .25;
        g.beginPath(); g.arc(o.x * w, o.y * h, o.r, 0, 6.3); g.fill();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
