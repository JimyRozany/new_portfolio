import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { saveSettings } from "./actions";
import { SETTING_KEYS } from "./keys";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full rounded-xl border bg-transparent px-4 py-2 text-sm";
const line = { borderColor: "var(--line)" };
const labels: Record<(typeof SETTING_KEYS)[number], string> = { name: "Name", role: "Role / headline", intro: "Hero intro", about: "About", edu: "Education" };

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const rows = await db!.setting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.key, r]));
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin" className="chip">← Dashboard</Link>
      <h1 className="mb-2 mt-3 text-3xl font-black">Home content</h1>
      <p className="text-sm" style={{ color: "var(--muted)" }}>Leave a field empty to use the built-in CV text.</p>
      {saved && <p role="status" className="mt-4 text-sm" style={{ color: "var(--accent2)" }}>Saved.</p>}
      <form action={saveSettings} className="glass mt-6 space-y-5 p-8">
        {SETTING_KEYS.map((k) => (
          <fieldset key={k} className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-1 font-semibold">{labels[k]}</legend>
            <textarea name={`${k}En`} rows={k === "name" || k === "role" ? 1 : 3} defaultValue={s[k]?.valueEn ?? ""} aria-label={`${labels[k]} (EN)`} className={input} style={line} />
            <textarea name={`${k}Ar`} rows={k === "name" || k === "role" ? 1 : 3} dir="rtl" defaultValue={s[k]?.valueAr ?? ""} aria-label={`${labels[k]} (AR)`} className={input} style={line} />
          </fieldset>
        ))}
        <button className="btn">Save</button>
      </form>
    </main>
  );
}
