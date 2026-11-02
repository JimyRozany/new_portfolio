import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/readex-pro";
import "@fontsource-variable/jetbrains-mono";
import "../globals.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Separate root layout from [locale]: admin is English/LTR and never indexed.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("js");try{document.documentElement.dataset.theme=localStorage.getItem("theme")||"dark"}catch(e){}` }} /></head>
      <body>{children}</body>
    </html>
  );
}
