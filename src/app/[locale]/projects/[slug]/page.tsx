import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectPreview from "@/components/ProjectPreview";
import Reveal from "@/components/Reveal";
import { ux, locales, type L } from "@/lib/content";
import { getProject, getProjects } from "@/lib/data";

type P = { params: Promise<{ locale: string; slug: string }> };
export const revalidate = 60;
export async function generateStaticParams() {
  const projects = await getProjects();
  return locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params; const l = locale as L; const p = await getProject(slug);
  if (!p) return {};
  return { title: p.title[l], description: p.desc[l], alternates: { canonical: `/${l}/projects/${slug}`, languages: { ar: `/ar/projects/${slug}`, en: `/en/projects/${slug}` } }, openGraph: { title: p.title[l], description: p.desc[l] } };
}

const Out = () => <svg className="arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg>;
const Back = () => <svg className="arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

export default async function Page({ params }: P) {
  const { locale, slug } = await params; const l = locale as L;
  const [p, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!p) notFound();
  const i = all.findIndex((x) => x.slug === slug);
  const prev = i > 0 ? all[i - 1] : null, next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
  return (
    <main id="main" className="detail">
      <div className="wrap">
        <Link href={`/${l}#projects`} className="link-u back"><Back />{ux.allProjects[l]}</Link>
        <p className="eyebrow" style={{ marginTop: "2.2rem" }}>{ux.project[l]} {String(i + 1).padStart(2, "0")} / {String(all.length).padStart(2, "0")}</p>
        <h1 className="display">{p.title[l]}</h1>
        <p className="lead" style={{ marginTop: "1.4rem" }}>{p.desc[l]}</p>

        <div className="detail-media">
          {p.imageUrl
            // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL on an arbitrary host
            ? <img src={p.imageUrl} alt={p.title[l]} decoding="async" />
            : <ProjectPreview slug={p.slug} title={p.title[l]} label={ux.concept[l]} />}
        </div>

        <div className="detail-grid">
          <Reveal>
            <h2 className="eyebrow" style={{ marginBottom: "1rem" }}>{ux.contributions[l]}</h2>
            <ol className="numlist">{p.points[l].map((x) => <li key={x}><span>{x}</span></li>)}</ol>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="eyebrow" style={{ marginBottom: "1rem" }}>{l === "ar" ? "التقنيات" : "Stack"}</h2>
            <ul className="tags">{p.tech.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
            {(p.liveUrl || p.repoUrl) && (
              <div className="hero-cta" style={{ marginTop: "2rem" }}>
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn">{ux.live[l]}<Out /></a>}
                {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="btn ghost">{ux.source[l]}</a>}
              </div>
            )}
          </Reveal>
        </div>

        {(prev || next) && (
          <nav className="pn" aria-label="projects">
            {prev ? <Link href={`/${l}/projects/${prev.slug}`}><span className="eyebrow">{ux.prev[l]}</span><span className="t">{prev.title[l]}</span></Link> : <span />}
            {next ? <Link href={`/${l}/projects/${next.slug}`} className="next"><span className="eyebrow">{ux.next[l]}</span><span className="t">{next.title[l]}</span></Link> : <span />}
          </nav>
        )}
      </div>
    </main>
  );
}
