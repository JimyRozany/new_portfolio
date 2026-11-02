import { db } from "./db";
import * as fallback from "./content";
import type { L } from "./content";

type Bi<T> = Record<L, T>;
export type HomeProject = { slug: string; title: Bi<string>; desc: Bi<string>; points: Bi<string[]>; tech: string[]; pro: boolean; imageUrl?: string | null; liveUrl?: string | null; repoUrl?: string | null };
export type HomeExperience = { company: string; period: Bi<string>; role: Bi<string>; bullets: Bi<string[]> };
export type HomeService = { title: Bi<string>; desc: Bi<string> };
export type HomeData = {
  ui: { name: Bi<string>; role: Bi<string>; intro: Bi<string>; about: Bi<string>; edu: Bi<string> };
  skills: Record<string, string[]>;
  experience: HomeExperience[];
  projects: HomeProject[];
  services: HomeService[];
};

const staticHome = (): HomeData => ({
  ui: fallback.ui,
  skills: fallback.skills,
  experience: fallback.experience,
  projects: fallback.projects,
  services: [],
});

/** DB is the source once seeded; any miss (no URL, empty tables, query error) falls back to content.ts. */
export async function getHomeData(): Promise<HomeData> {
  const base = staticHome();
  if (!db) return base;
  try {
    const [projects, skills, experience, settings, services] = await Promise.all([
      db.project.findMany({ where: { published: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }),
      db.skill.findMany({ orderBy: { sort: "asc" } }),
      db.experience.findMany({ orderBy: { sort: "asc" } }),
      db.setting.findMany(),
      db.service.findMany({ where: { published: true }, orderBy: { sort: "asc" } }),
    ]);

    const s = Object.fromEntries(settings.map((x) => [x.key, x]));
    const text = (k: keyof HomeData["ui"]): Bi<string> =>
      s[k] ? { ar: s[k].valueAr || base.ui[k].ar, en: s[k].valueEn || base.ui[k].en } : base.ui[k];

    const grouped: Record<string, string[]> = {};
    for (const k of skills) (grouped[k.category] ??= []).push(k.name);

    return {
      ui: { name: text("name"), role: text("role"), intro: text("intro"), about: text("about"), edu: text("edu") },
      skills: skills.length ? grouped : base.skills,
      experience: experience.length
        ? experience.map((e) => ({
            company: e.company,
            period: { ar: e.periodAr, en: e.periodEn },
            role: { ar: e.roleAr, en: e.roleEn },
            bullets: { ar: e.bulletsAr, en: e.bulletsEn },
          }))
        : base.experience,
      projects: projects.length
        ? projects.map((p) => ({
            slug: p.slug,
            title: { ar: p.titleAr, en: p.titleEn },
            desc: { ar: p.descAr, en: p.descEn },
            points: { ar: p.pointsAr, en: p.pointsEn },
            tech: p.tech,
            pro: p.kind === "professional",
            imageUrl: p.imageUrl, liveUrl: p.liveUrl, repoUrl: p.repoUrl,
          }))
        : base.projects,
      services: services.map((s) => ({ title: { ar: s.titleAr, en: s.titleEn }, desc: { ar: s.descAr, en: s.descEn } })),
    };
  } catch (err) {
    console.error("[data] DB read failed, using static content:", err);
    return base;
  }
}

export type ProjectDetail = HomeProject;

const staticProjects = (): ProjectDetail[] => fallback.projects;

/** All published projects with full detail. DB first; empty/missing/error -> content.ts. */
export async function getProjects(): Promise<ProjectDetail[]> {
  if (!db) return staticProjects();
  try {
    const rows = await db.project.findMany({
      where: { published: true },
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    });
    if (!rows.length) return staticProjects();
    return rows.map((p) => ({
      slug: p.slug,
      title: { ar: p.titleAr, en: p.titleEn },
      desc: { ar: p.descAr, en: p.descEn },
      points: { ar: p.pointsAr, en: p.pointsEn },
      tech: p.tech,
      pro: p.kind === "professional",
      imageUrl: p.imageUrl, liveUrl: p.liveUrl, repoUrl: p.repoUrl,
    }));
  } catch (err) {
    console.error("[data] getProjects failed, using static content:", err);
    return staticProjects();
  }
}

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}
