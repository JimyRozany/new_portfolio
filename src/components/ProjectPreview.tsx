import type { CSSProperties } from "react";

/**
 * Abstract CSS interface concept built from the project's REAL title/slug/tech.
 * It is deliberately generic (skeleton lines, blocks, bars) — NOT a screenshot of the product,
 * and is labelled "Interface concept" in the UI.
 */
const hash = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const VARIANTS = ["dashboard", "table", "board", "sequence", "grid", "store"] as const;
type V = (typeof VARIANTS)[number];
const BY_SLUG: Record<string, V> = { desar: "dashboard", genaptx: "sequence", "follow-up": "board", erp: "table", "game-unity": "grid" };

export default function ProjectPreview({ slug, title, label, compact = false }: { slug: string; title: string; label: string; compact?: boolean }) {
  const h = hash(slug), r = rng(h), v: V = BY_SLUG[slug] ?? VARIANTS[h % VARIANTS.length];
  const hue = (h * 47) % 360;
  const ln = (w = 40 + r() * 55, extra = "") => <i className={`ln ${extra}`} style={{ width: `${w}%` }} />;
  const bars = Array.from({ length: 9 }, () => 18 + r() * 82);
  const peak = bars.indexOf(Math.max(...bars));

  let body: React.ReactNode;
  if (v === "dashboard" || v === "sequence") {
    body = (<>
      <div className="pv-col pv-side">{ln(80, "ac")}{ln()}{ln()}{ln()}{ln()}</div>
      <div className="pv-col pv-main">
        <div className="pv-row">{[0, 1, 2].map((i) => <div key={i} className="blk">{ln(35)}{ln(70, i === 0 ? "ac" : "")}</div>)}</div>
        <div className="pv-bars">{bars.map((b, i) => <i key={i} className={i === peak || v === "sequence" && i % 3 === 0 ? "hi" : ""} style={{ height: `${v === "sequence" ? 25 + ((i * 37) % 70) : b}%`, ...(v === "sequence" ? { borderRadius: 99, flexBasis: 4, maxWidth: 6 } : {}) }} />)}</div>
        {ln()}{ln()}
      </div>
    </>);
  } else if (v === "table") {
    body = (<div className="pv-col pv-main"><div className="pv-row">{[0, 1, 2, 3].map((i) => <div key={i}>{ln(60, "ac")}</div>)}</div>
      {Array.from({ length: 7 }, (_, i) => <div key={i} className="pv-row" style={i === 2 ? { background: `hsl(${hue} 78% 58% / .14)`, borderRadius: 4, padding: ".25rem 0" } : undefined}>{[0, 1, 2, 3].map((k) => <div key={k}>{ln(35 + r() * 55)}</div>)}</div>)}</div>);
  } else if (v === "board") {
    body = (<>{[0, 1, 2].map((c) => <div key={c} className="pv-col pv-main"><div className="blk" style={{ padding: ".35rem .5rem" }}>{ln(55, "ac")}</div>{Array.from({ length: 3 - (c % 2) }, (_, i) => <div key={i} className="blk">{ln(80)}{ln(50, i === 0 && c === 1 ? "ac" : "")}</div>)}</div>)}</>);
  } else if (v === "grid") {
    body = (<div className="pv-col pv-main"><div className="blk" style={{ aspectRatio: "3 / 1", background: `linear-gradient(120deg, hsl(${hue} 78% 58% / .4), hsl(${hue + 70} 78% 58% / .12))` }}>{ln(30, "ac")}{ln(50)}</div><div className="pv-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="pv-tile" style={{ opacity: 0.55 + (i % 3) * 0.2 }} />)}</div></div>);
  } else {
    body = (<div className="pv-col pv-main"><div className="blk" style={{ aspectRatio: "4 / 1" }}>{ln(40, "ac")}{ln(60)}</div><div className="pv-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="blk"><div className="pv-tile" style={{ aspectRatio: "3 / 2" }} />{ln(70)}</div>)}</div></div>);
  }
  return (
    <div className="pv" style={{ "--h": hue } as CSSProperties} aria-hidden>
      <div className="pv-win">
        <div className="pv-bar"><i /><i /><i /><span>{title}</span></div>
        <div className="pv-body">{body}</div>
      </div>
      {!compact && <span className="pv-tag">{label}</span>}
    </div>
  );
}
