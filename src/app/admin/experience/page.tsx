import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteExperience } from "./actions";

export const dynamic = "force-dynamic";

export default async function ExperienceList() {
  await requireAdmin();
  const rows = await db!.experience.findMany({ orderBy: { sort: "asc" } });
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div><Link href="/admin" className="chip">← Dashboard</Link><h1 className="mt-3 text-3xl font-black">Experience</h1></div>
        <Link href="/admin/experience/new" className="btn">New entry</Link>
      </header>
      <ul className="mt-8 space-y-3">
        {rows.map((e) => (
          <li key={e.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
            <div><div className="font-semibold">{e.roleEn} — {e.company}</div><div className="text-xs" style={{ color: "var(--muted)" }}>{e.periodEn} · sort {e.sort}</div></div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/experience/${e.id}`} className="btn ghost !px-4 !py-1 text-sm">Edit</Link>
              <form action={deleteExperience.bind(null, e.id)}><button className="chip" style={{ color: "#ff6b6b" }}>Delete</button></form>
            </div>
          </li>
        ))}
        {!rows.length && <li className="text-sm" style={{ color: "var(--muted)" }}>No entries. The site shows the built-in CV content until you add one.</li>}
      </ul>
    </main>
  );
}
