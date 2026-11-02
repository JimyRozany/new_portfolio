import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/readex-pro";
import "@fontsource-variable/jetbrains-mono";
import "../globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { locales, ui, ux, SITE, type L } from "@/lib/content";

export const generateStaticParams = () => locales.map((locale) => ({ locale }));
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const l = locale as L;
  if (!locales.includes(l)) return {};
  return {
    metadataBase: new URL(SITE),
    title: { default: `${ui.name[l]} — ${ui.role[l]}`, template: `%s | ${ui.name[l]}` },
    description: ui.intro[l],
    alternates: { canonical: `/${l}`, languages: { ar: "/ar", en: "/en" } },
    openGraph: { title: ui.name[l], description: ui.intro[l], locale: l === "ar" ? "ar_EG" : "en_US", type: "website" },
  };
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params; const l = locale as L;
  if (!locales.includes(l)) notFound();
  // order matches the page; labels come from ui.nav (about, skills, experience, projects, contact)
  const idx = { about: 0, skills: 1, experience: 2, projects: 3, contact: 4 } as const;
  const items = (["about", "projects", "skills", "experience", "contact"] as const).map((id) => ({ id, label: ui.nav[l][idx[id]] }));
  return (
    <html lang={l} dir={l === "ar" ? "rtl" : "ltr"} data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("js");try{document.documentElement.dataset.theme=localStorage.getItem("theme")||"dark"}catch(e){}` }} /></head>
      <body>
        <a href="#main" className="skip">{ux.skip[l]}</a>
        <div id="top" />
        <Nav l={l} name={ui.name[l]} items={items} themeLabel={l === "ar" ? "تبديل الوضع" : "Toggle theme"} menuLabel={ux.menu[l]} closeLabel={ux.close[l]} progressLabel={ux.progress[l]} />
        {children}
        <Footer l={l} name={ui.name[l]} items={items} />
      </body>
    </html>
  );
}
