"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type ProjectState = { error?: string };

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const optUrl = z
  .string().trim().max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "URLs must start with http:// or https://")
  .transform((v) => v || null);

const schema = z.object({
  slug: z.string().trim().toLowerCase().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: lowercase letters, digits and dashes only"),
  titleAr: z.string().trim().min(1, "Arabic title is required").max(200),
  titleEn: z.string().trim().min(1, "English title is required").max(200),
  descAr: z.string().trim().min(1, "Arabic description is required").max(2000),
  descEn: z.string().trim().min(1, "English description is required").max(2000),
  pointsAr: z.string().max(5000).transform(lines),
  pointsEn: z.string().max(5000).transform(lines),
  tech: z.string().max(500).transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean)),
  imageUrl: optUrl,
  liveUrl: optUrl,
  repoUrl: optUrl,
  kind: z.enum(["professional", "personal"]),
  sort: z.coerce.number().int().min(0).max(9999),
});

function refresh(slug?: string) {
  revalidatePath("/ar"); revalidatePath("/en"); revalidatePath("/sitemap.xml");
  if (slug) for (const l of ["ar", "en"]) revalidatePath(`/${l}/projects/${slug}`);
  revalidatePath("/admin/projects");
}

export async function saveProject(_prev: ProjectState, form: FormData): Promise<ProjectState> {
  await requireAdmin();
  const keys = ["slug", "titleAr", "titleEn", "descAr", "descEn", "pointsAr", "pointsEn", "tech", "imageUrl", "liveUrl", "repoUrl", "kind", "sort"] as const;
  const raw = Object.fromEntries(keys.map((k) => [k, String(form.get(k) ?? "")]));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const data = { ...parsed.data, featured: form.get("featured") === "on", published: form.get("published") === "on" };
  const id = String(form.get("id") ?? "");

  try {
    if (id && id !== "new") {
      const before = await db!.project.findUnique({ where: { id }, select: { slug: true } });
      await db!.project.update({ where: { id }, data });
      if (before && before.slug !== data.slug) refresh(before.slug);
    } else {
      await db!.project.create({ data });
    }
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { error: "That slug is already used by another project." };
    console.error("[admin] saveProject failed:", e);
    return { error: "Could not save. Check the server logs." };
  }
  refresh(data.slug);
  redirect("/admin/projects");
}

export async function setFlag(id: string, flag: "published" | "featured", value: boolean) {
  await requireAdmin();
  const p = await db!.project.update({ where: { id }, data: { [flag]: value }, select: { slug: true } });
  refresh(p.slug);
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const p = await db!.project.delete({ where: { id }, select: { slug: true } });
  refresh(p.slug);
}
