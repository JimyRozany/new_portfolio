import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const admin = await requireAdmin();
  const [projects, experience, skills, services, unread] = await Promise.all([
    db!.project.count(), db!.experience.count(), db!.skill.count(), db!.service.count(), db!.message.count({ where: { read: false } }),
  ]);
  const cards = [
    ["Projects", projects, "/admin/projects"],
    ["Experience", experience, "/admin/experience"],
    ["Skills", skills, "/admin/skills"],
    ["Services", services, "/admin/services"],
    ["Unread messages", unread, "/admin/messages"],
  ] as const;
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Signed in as {admin.email}</p>
        </div>
        <form action={logout}><button className="btn ghost">Log out</button></form>
      </header>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, n, href]) => (
          <Link key={label} href={href} className="glass block p-6 transition-transform hover:-translate-y-1">
            <div className="text-3xl font-black">{n}</div><div className="text-sm" style={{ color: "var(--muted)" }}>{label}</div>
          </Link>
        ))}
        <Link href="/admin/settings" className="glass block p-6 transition-transform hover:-translate-y-1">
          <div className="text-lg font-black">Home content</div><div className="text-sm" style={{ color: "var(--muted)" }}>Name, intro, about</div>
        </Link>
      </section>
    </main>
  );
}
