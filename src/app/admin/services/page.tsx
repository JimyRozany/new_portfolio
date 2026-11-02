import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { addService, updateService, deleteService } from "./actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full rounded-xl border bg-transparent px-3 py-1.5 text-sm";
const line = { borderColor: "var(--line)" };

type S = { id?: string; titleAr: string; titleEn: string; descAr: string; descEn: string; published: boolean; sort: number };
function Fields({ s }: { s: S }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs">Title (EN)<input name="titleEn" required defaultValue={s.titleEn} className={input} style={line} /></label>
      <label className="text-xs">العنوان (AR)<input name="titleAr" required dir="rtl" defaultValue={s.titleAr} className={input} style={line} /></label>
      <label className="text-xs">Description (EN)<textarea name="descEn" required rows={2} defaultValue={s.descEn} className={input} style={line} /></label>
      <label className="text-xs">الوصف (AR)<textarea name="descAr" required dir="rtl" rows={2} defaultValue={s.descAr} className={input} style={line} /></label>
      <label className="text-xs">Sort<input name="sort" type="number" defaultValue={s.sort} className={input} style={line} /></label>
      <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" name="published" defaultChecked={s.published} /> Published</label>
    </div>
  );
}

export default async function Services() {
  await requireAdmin();
  const rows = await db!.service.findMany({ orderBy: { sort: "asc" } });
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin" className="chip">← Dashboard</Link>
      <h1 className="mb-6 mt-3 text-3xl font-black">Services</h1>
      <form action={addService} className="glass mb-8 space-y-3 p-5">
        <h2 className="font-semibold">Add service</h2>
        <Fields s={{ titleAr: "", titleEn: "", descAr: "", descEn: "", published: true, sort: rows.length }} />
        <button className="btn !px-5 !py-1.5 text-sm">Add</button>
      </form>
      <ul className="space-y-4">
        {rows.map((s) => (
          <li key={s.id} className="glass p-5">
            <form action={updateService.bind(null, s.id)} className="space-y-3">
              <Fields s={s} />
              <button className="chip">Save</button>
            </form>
            <form action={deleteService.bind(null, s.id)} className="mt-2"><button className="chip" style={{ color: "#ff6b6b" }}>Delete</button></form>
          </li>
        ))}
      </ul>
    </main>
  );
}
