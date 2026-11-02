import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import ProjectForm, { type ProjectValues } from "./ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let v: ProjectValues = {
    id: "new", slug: "", titleAr: "", titleEn: "", descAr: "", descEn: "", pointsAr: "", pointsEn: "",
    tech: "", imageUrl: "", liveUrl: "", repoUrl: "", kind: "professional", sort: 0, featured: false, published: false,
  };
  if (id !== "new") {
    const p = await db!.project.findUnique({ where: { id } });
    if (!p) notFound();
    v = {
      id: p.id, slug: p.slug, titleAr: p.titleAr, titleEn: p.titleEn, descAr: p.descAr, descEn: p.descEn,
      pointsAr: p.pointsAr.join("\n"), pointsEn: p.pointsEn.join("\n"), tech: p.tech.join(", "),
      imageUrl: p.imageUrl ?? "", liveUrl: p.liveUrl ?? "", repoUrl: p.repoUrl ?? "",
      kind: p.kind, sort: p.sort, featured: p.featured, published: p.published,
    };
  }
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/projects" className="chip">← Projects</Link>
      <h1 className="mt-3 text-3xl font-black">{id === "new" ? "New project" : `Edit: ${v.titleEn}`}</h1>
      <ProjectForm v={v} />
    </main>
  );
}
