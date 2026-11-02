// Edge-safe session signing (Web Crypto only) — imported by middleware AND server code.
// Token = base64url(JSON payload) + "." + base64url(HMAC-SHA256). Do not import next/headers here.
export const COOKIE = "admin_session";
export const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days, seconds

const enc = new TextEncoder();

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET is missing or shorter than 32 chars (openssl rand -base64 32)");
  return s;
}

const toB64u = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64u = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const hmacKey = (usage: "sign" | "verify") =>
  crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [usage]);

export type Session = { sub: string; exp: number };

export async function signSession(adminId: string): Promise<string> {
  const payload: Session = { sub: adminId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL };
  const body = toB64u(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey("sign"), enc.encode(body));
  return `${body}.${toB64u(new Uint8Array(sig))}`;
}

/** Returns the session if the signature is valid and not expired; otherwise null (never throws). */
export async function verifySession(token?: string | null): Promise<Session | null> {
  try {
    if (!token) return null;
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    // subtle.verify compares in constant time
    const ok = await crypto.subtle.verify("HMAC", await hmacKey("verify"), fromB64u(sig) as BufferSource, enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64u(body))) as Session;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}
