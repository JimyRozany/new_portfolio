"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { startSession, endSession } from "@/lib/session";

export type LoginState = { error?: string };

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

// Best-effort throttle (in-memory: per server instance, resets on restart/cold start).
const attempts = new Map<string, { n: number; reset: number }>();
const MAX = 5, WINDOW = 15 * 60 * 1000;
// Compared against when the email doesn't exist, so response time doesn't reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync("not-the-password", 10);

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  if (!db) return { error: "Database is not configured (DATABASE_URL)." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${ip}|${parsed.data.email}`;
  const now = Date.now();
  const rec = attempts.get(key);
  if (rec && rec.reset > now && rec.n >= MAX) return { error: "Too many attempts. Try again in 15 minutes." };

  const admin = await db.admin.findUnique({ where: { email: parsed.data.email } });
  const ok = await bcrypt.compare(parsed.data.password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) {
    attempts.set(key, rec && rec.reset > now ? { n: rec.n + 1, reset: rec.reset } : { n: 1, reset: now + WINDOW });
    return { error: "Invalid email or password." };
  }

  attempts.delete(key);
  await startSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
