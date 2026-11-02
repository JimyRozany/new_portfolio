// Server-only helpers (Server Components / Server Actions / Route Handlers).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { COOKIE, SESSION_TTL, signSession, verifySession } from "./auth";

export async function startSession(adminId: string) {
  (await cookies()).set(COOKIE, await signSession(adminId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Use at the top of every admin page / action. Middleware is the first gate; this is the real check. */
export async function requireAdmin() {
  const session = await verifySession((await cookies()).get(COOKIE)?.value);
  if (!session || !db) redirect("/admin/login");
  const admin = await db.admin.findUnique({ where: { id: session.sub }, select: { id: true, email: true } });
  if (!admin) redirect("/admin/login"); // deleted admin => session dies immediately
  return admin;
}
