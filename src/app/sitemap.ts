import type { MetadataRoute } from "next";
import { locales, SITE } from "@/lib/content";
import { getProjects } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return locales.flatMap((l) => [`/${l}`, ...projects.map((p) => `/${l}/projects/${p.slug}`)].map((u) => ({ url: SITE + u })));
}
