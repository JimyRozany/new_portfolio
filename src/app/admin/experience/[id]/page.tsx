import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import ExperienceForm, { type ExperienceValues } from "./ExperienceForm";

export const dynamic = "force-dynamic";

export default async function EditExperience({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let v: ExperienceValues = { id: "new", company: "", roleAr: "", roleEn: "", periodAr: "", periodEn: "", bulletsAr: "", bulletsEn: "", sort: 0 };
  if (id !== "new") {
    const e = await db!.experience.findUnique({ where: { id } });
    if (!e) notFound();
    v = { id: e.id, company: e.company, roleAr: e.roleAr, roleEn: e.roleEn, periodAr: e.periodAr, periodEn: e.periodEn, bulletsAr: e.bulletsAr.join("\n"), bulletsEn: e.bulletsEn.join("\n"), sort: e.sort };
  }
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/experience" className="chip">← Experience</Link>
      <h1 className="mt-3 text-3xl font-black">{id === "new" ? "New entry" : `Edit: ${v.company}`}</h1>
      <ExperienceForm v={v} />
    </main>
  );
}
