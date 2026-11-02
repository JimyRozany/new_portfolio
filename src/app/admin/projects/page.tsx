import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { setFlag, deleteProject } from "./actions";

export const dynamic = "force-dynamic";

export default async function Projects() {
  await requireAdmin();
  const rows = await db!.project.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="chip">← Dashboard</Link>
          <h1 className="mt-3 text-3xl font-black">Projects</h1>
        </div>
        <Link href="/admin/projects/new" className="btn">New project</Link>
      </header>
      <ul className="mt-8 space-y-3">
        {rows.map((p) => (
          <li key={p.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-semibold">{p.titleEn}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>/{p.slug} · {p.kind} · sort {p.sort}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <form action={setFlag.bind(null, p.id, "published", !p.published)}>
                <button className="chip">{p.published ? "Published ✓" : "Draft"}</button>
              </form>
              <form action={setFlag.bind(null, p.id, "featured", !p.featured)}>
                <button className="chip">{p.featured ? "Featured ★" : "Not featured"}</button>
              </form>
              <Link href={`/admin/projects/${p.id}`} className="btn ghost !px-4 !py-1 text-sm">Edit</Link>
              <form action={deleteProject.bind(null, p.id)}>
                <button className="chip" style={{ color: "#ff6b6b" }}>Delete</button>
              </form>
            </div>
          </li>
        ))}
        {!rows.length && <li className="text-sm" style={{ color: "var(--muted)" }}>No projects yet. Run <code>npm run db:seed</code> or create one.</li>}
      </ul>
    </main>
  );
}
