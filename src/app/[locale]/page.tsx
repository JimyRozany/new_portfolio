import Link from "next/link";
import type { ReactNode } from "react";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import Spotlight from "@/components/Spotlight";
import ProjectPreview from "@/components/ProjectPreview";
import Timeline from "@/components/Timeline";
import CopyEmail from "@/components/CopyEmail";
import ContactForm from "@/components/ContactForm";
import { ui as staticUi, ux, contact, type L } from "@/lib/content";
import { getHomeData, type HomeProject } from "@/lib/data";

export const revalidate = 60; // re-read DB at most once a minute

const Arrow = ({ s = 16 }: { s?: number }) => <svg className="arrow" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Out = ({ s = 16 }: { s?: number }) => <svg className="arrow" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg>;
const Head = ({ n, children }: { n: string; children: ReactNode }) => <Reveal className="sh"><span className="n">{n}</span><h2 className="display">{children}</h2></Reveal>;

function Glyph({ name }: { name: string }) {
  const p = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  if (/back|server|api|data/i.test(name)) return <svg {...p}><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></svg>;
  if (/front|ui|web|react/i.test(name)) return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m10 10-2 2 2 2M14 10l2 2-2 2" /></svg>;
  return <svg {...p}><path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2-.5-.5-2z" /></svg>;
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const l = (await params).locale as L; const h = staticUi.h[l];
  const { ui: t, skills, experience, projects, services } = await getHomeData();

  // "Full Stack Developer — Laravel · React · Next.js" => kicker + stack chips (falls back gracefully if no dash)
  const [roleTitle, roleStack = ""] = t.role[l].split(/\s+[—–]\s+/);
  const stack = roleStack.split(/\s*[·•|]\s*/).map((s) => s.trim()).filter(Boolean);

  let n = 0; const num = () => String(++n).padStart(2, "0");
  const pro = projects.filter((p) => p.pro), personal = projects.filter((p) => !p.pro);
  let featureCount = 0;
  const cardKind = (i: number) => {
    const feature = i % 3 === 0 || (i === pro.length - 1 && i % 3 === 1);
    return feature ? `feature${featureCount++ % 2 ? " flip" : ""}` : "half";
  };
  const media = (p: HomeProject, compact = false) => p.imageUrl
    // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL on an arbitrary host
    ? <img src={p.imageUrl} alt={p.title[l]} loading="lazy" decoding="async" />
    : <ProjectPreview slug={p.slug} title={p.title[l]} label={ux.concept[l]} compact={compact} />;

  const core = Object.values(skills).flatMap((v) => v.slice(0, 4)).slice(0, 12);

  return (
    <main id="main">
      <Hero
        name={t.name[l]} title={roleTitle} stack={stack} intro={t.intro[l]}
        cta={h.cta} ctaHref="#projects" secondary={h.contact} secondaryHref="#contact" scroll={ux.scroll[l]}
        socials={[{ label: "GitHub", href: contact.github }, { label: "LinkedIn", href: contact.linkedin }, { label: contact.email, href: `mailto:${contact.email}` }]}
      />

      <section id="about" className="section"><div className="wrap">
        <Head n={num()}>{h.about}</Head>
        <div className="about">
          <Reveal><div className="about-mark" aria-hidden><i /><i /><i /><b /></div></Reveal>
          <Reveal delay={0.1}>
            <p className="about-text">{t.about[l]}</p>
            <dl className="facts">
              <div><dt className="eyebrow">{h.edu}</dt><dd>{t.edu[l]}</dd></div>
              {stack.length > 0 && <div><dt className="eyebrow">{h.tech}</dt><dd><ul className="tags">{stack.map((s) => <li key={s} className="chip">{s}</li>)}</ul></dd></div>}
            </dl>
          </Reveal>
        </div>
      </div></section>

      <section id="projects" className="section"><div className="wrap">
        <Head n={num()}>{h.projects}</Head>
        <div className="pgrid">
          {pro.map((p, i) => (
            <Spotlight key={p.slug} className={`pcard ${cardKind(i)}`} delay={(i % 2) * 0.08}>
              <div className="pcard-in">
                <div className="pcard-media">
                  {media(p)}
                  <span className="pcard-go" aria-hidden><Out /></span>
                </div>
                <div className="pcard-meta">
                  <span className="idx">{String(i + 1).padStart(2, "0")} / {String(pro.length).padStart(2, "0")}</span>
                  <h3 className="display"><Link href={`/${l}/projects/${p.slug}`}>{p.title[l]}</Link></h3>
                  <p className="purpose">{p.desc[l]}</p>
                  {p.points[l][0] && <div className="contrib"><span className="eyebrow">{ux.contribution[l]}</span><p>{p.points[l][0]}</p></div>}
                  <ul className="tags">{p.tech.map((x) => <li key={x} className="chip">{x}</li>)}</ul>
                  <span className="plink">{ux.viewProject[l]}<Arrow s={15} /></span>
                </div>
              </div>
            </Spotlight>
          ))}
        </div>

        {personal.length > 0 && <>
          <Reveal className="sub-h"><span className="eyebrow">{h.personal}</span></Reveal>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {personal.map((p, i) => (
              <Reveal as="li" key={p.slug} className="prow" delay={i * 0.05}>
                <div className="prow-thumb" aria-hidden>{media(p, true)}</div>
                <div>
                  <h4><Link href={`/${l}/projects/${p.slug}`}>{p.title[l]}</Link></h4>
                  <ul className="tags" style={{ marginTop: ".5rem" }}>{p.tech.slice(0, 4).map((x) => <li key={x} className="chip">{x}</li>)}</ul>
                </div>
                <p className="d">{p.desc[l]}</p>
                <span className="go" aria-hidden><Out s={14} /></span>
              </Reveal>
            ))}
          </ul>
        </>}
      </div></section>

      <section id="skills" className="section"><div className="wrap">
        <Head n={num()}>{h.skills}</Head>
        <Reveal><p className="lead" style={{ marginTop: "-2rem", marginBottom: "2.5rem" }}>{ux.skillsNote[l]}</p></Reveal>
        <div className="sk-wrap">
          {Object.entries(skills).map(([k, v], i) => (
            <Reveal key={k} className="sk-row" delay={i * 0.06}>
              <div className="sk-name"><Glyph name={k} /><div><span className="n">{String(i + 1).padStart(2, "0")}</span><h3 className="display">{k}</h3></div></div>
              <ul className="sk-list">{v.map((s) => <li key={s}>{s}</li>)}</ul>
            </Reveal>
          ))}
        </div>
        <div className="marquee" aria-hidden><div className="marquee-track">{[...core, ...core, ...core, ...core].map((s, i) => <span key={i}>{s}</span>)}</div></div>
      </div></section>

      <section id="experience" className="section"><div className="wrap">
        <Head n={num()}>{h.exp}</Head>
        <Timeline items={experience.map((e) => ({ company: e.company, role: e.role[l], period: e.period[l], bullets: e.bullets[l] }))} />
      </div></section>

      {services.length > 0 && (
        <section id="services" className="section"><div className="wrap">
          <Head n={num()}>{h.services}</Head>
          <div className="svc-wrap">
            {services.map((s, i) => (
              <Reveal key={s.title.en} className="svc" delay={i * 0.05}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display">{s.title[l]}</h3>
                <p>{s.desc[l]}</p>
              </Reveal>
            ))}
          </div>
        </div></section>
      )}

      <section id="contact" className="section contact"><div className="wrap">
        <Head n={num()}>{h.contact}</Head>
        <div className="contact-grid">
          <Reveal>
            <p className="display big">{ux.letsTalk[l]}</p>
            <p className="lead" style={{ marginTop: "1.4rem" }}>{ux.contactLead[l]}</p>
            <CopyEmail email={contact.email} copy={ux.copy[l]} copied={ux.copied[l]} />
            <ul className="social">
              <li><a href={contact.github} target="_blank" rel="noopener noreferrer"><span>GitHub</span><Out /></a></li>
              <li><a href={contact.linkedin} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><Out /></a></li>
              <li><a href={`tel:${contact.phone.replace(/\s/g, "")}`}><span dir="ltr">{contact.phone}</span><Out /></a></li>
            </ul>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="form-card"><h3 className="display" style={{ fontSize: "1.4rem" }}>{ux.orMessage[l]}</h3><ContactForm l={l} /></div>
          </Reveal>
        </div>
      </div></section>
    </main>
  );
}
