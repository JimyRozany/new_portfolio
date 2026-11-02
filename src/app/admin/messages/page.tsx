import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { setRead, deleteMessage } from "./actions";

export const dynamic = "force-dynamic";

export default async function Messages() {
  await requireAdmin();
  const rows = await db!.message.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin" className="chip">← Dashboard</Link>
      <h1 className="mb-6 mt-3 text-3xl font-black">Messages</h1>
      <ul className="space-y-3">
        {rows.map((m) => (
          <li key={m.id} className="glass p-5" style={m.read ? { opacity: 0.7 } : undefined}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">{!m.read && <span className="chip me-2" style={{ color: "var(--accent2)" }}>new</span>}{m.name} <a href={`mailto:${m.email}`} className="text-sm underline" dir="ltr">{m.email}</a></div>
              <time className="text-xs" style={{ color: "var(--muted)" }}>{m.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC</time>
            </div>
            {/* React escapes text; whitespace-pre-wrap keeps the sender's line breaks */}
            <p className="mt-2 whitespace-pre-wrap text-sm">{m.body}</p>
            <div className="mt-3 flex gap-2">
              <form action={setRead.bind(null, m.id, !m.read)}><button className="chip">{m.read ? "Mark unread" : "Mark read"}</button></form>
              <form action={deleteMessage.bind(null, m.id)}><button className="chip" style={{ color: "#ff6b6b" }}>Delete</button></form>
            </div>
          </li>
        ))}
        {!rows.length && <li className="text-sm" style={{ color: "var(--muted)" }}>No messages yet.</li>}
      </ul>
    </main>
  );
}
