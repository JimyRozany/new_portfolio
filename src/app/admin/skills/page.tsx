import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { addSkill, updateSkill, deleteSkill } from "./actions";

export const dynamic = "force-dynamic";
const input = "rounded-xl border bg-transparent px-3 py-1.5 text-sm";
const line = { borderColor: "var(--line)" };

export default async function Skills() {
  await requireAdmin();
  const rows = await db!.skill.findMany({ orderBy: [{ category: "asc" }, { sort: "asc" }] });
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin" className="chip">← Dashboard</Link>
      <h1 className="mb-6 mt-3 text-3xl font-black">Skills</h1>
      <form action={addSkill} className="glass mb-6 flex flex-wrap items-end gap-3 p-4">
        <label className="text-xs">Name<br /><input name="name" required className={input} style={line} /></label>
        <label className="text-xs">Category<br /><input name="category" required list="cats" className={input} style={line} /></label>
        <datalist id="cats">{[...new Set<string>(rows.map((r) => r.category))].map((c) => <option key={c} value={c} />)}</datalist>
        <label className="text-xs">Sort<br /><input name="sort" type="number" defaultValue={rows.length} className={`${input} w-24`} style={line} /></label>
        <button className="btn !px-5 !py-1.5 text-sm">Add</button>
      </form>
      <ul className="space-y-2">
        {rows.map((s) => (
          <li key={s.id} className="glass flex flex-wrap items-end gap-3 p-3">
            <form action={updateSkill.bind(null, s.id)} className="flex flex-wrap items-end gap-3">
              <input name="name" defaultValue={s.name} className={input} style={line} aria-label="Name" />
              <input name="category" defaultValue={s.category} className={input} style={line} aria-label="Category" />
              <input name="sort" type="number" defaultValue={s.sort} className={`${input} w-24`} style={line} aria-label="Sort" />
              <button className="chip">Save</button>
            </form>
            <form action={deleteSkill.bind(null, s.id)}><button className="chip" style={{ color: "#ff6b6b" }}>Delete</button></form>
          </li>
        ))}
        {!rows.length && <li className="text-sm" style={{ color: "var(--muted)" }}>No skills yet.</li>}
      </ul>
    </main>
  );
}
