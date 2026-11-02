"use server";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { form as t, type L } from "@/lib/content";

export type ContactState = { ok?: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  body: z.string().trim().min(10).max(3000),
});

// Best-effort throttle: per server instance, resets on restart/cold start.
const hits = new Map<string, { n: number; reset: number }>();
const MAX = 3, WINDOW = 10 * 60 * 1000;

export async function sendMessage(_prev: ContactState, f: FormData): Promise<ContactState> {
  const l: L = f.get("locale") === "en" ? "en" : "ar";
  if (f.get("website")) return { ok: true }; // honeypot: bots fill it, humans never see it
  const parsed = schema.safeParse({ name: String(f.get("name") ?? ""), email: String(f.get("email") ?? ""), body: String(f.get("body") ?? "") });
  if (!parsed.success) return { error: t.invalid[l] };
  if (!db) return { error: t.fail[l] };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const rec = hits.get(ip);
  if (rec && rec.reset > now && rec.n >= MAX) return { error: t.throttled[l] };
  hits.set(ip, rec && rec.reset > now ? { n: rec.n + 1, reset: rec.reset } : { n: 1, reset: now + WINDOW });

  try {
    await db.message.create({ data: parsed.data });
  } catch (e) {
    console.error("[contact] save failed:", e);
    return { error: t.fail[l] };
  }
  return { ok: true };
}
