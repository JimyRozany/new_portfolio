"use client";
/** Same behavior as before (data-theme + localStorage "theme"); icon switches purely via CSS. */
export default function ThemeToggle({ label }: { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className="icon-btn" onClick={() => {
      const d = document.documentElement, n = d.dataset.theme === "light" ? "dark" : "light";
      d.dataset.theme = n; try { localStorage.setItem("theme", n); } catch {}
    }}>
      <span className="theme-ico" aria-hidden>
        <svg className="ico-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        <svg className="ico-sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      </span>
    </button>
  );
}
