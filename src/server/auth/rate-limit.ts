import 'server-only';

/**
 * In-memory rate limiter for the admin sign-in endpoint.
 *
 * Why not a database or Redis table? The threat this defends against is a
 * password-guessing bot hitting one endpoint on one server. An in-process
 * counter is enough for that, adds no schema, and needs no extra service to
 * operate. The trade-off is honest and worth stating: on a multi-instance
 * deployment each instance keeps its own counters, so the effective limit
 * multiplies by the instance count. If the dashboard is ever scaled
 * horizontally, swap the `hits` map for a Redis `INCR` with a TTL and keep the
 * same interface.
 */

/** Five failed attempts inside this window locks the key out. */
const MAX_ATTEMPTS = 5;

/** The window itself, in milliseconds. */
const WINDOW_MS = 15 * 60 * 1000;

/** Long enough to slow a real attack, short enough to not lock out a forgetful owner. */
const LOCKOUT_MS = 15 * 60 * 1000;

type Bucket = { count: number; firstAt: number; lockedUntil: number };

const buckets = new Map<string, Bucket>();

/** Guard against unbounded growth if the endpoint is hammered with unique keys. */
const MAX_BUCKETS = 10_000;

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    const expired = now - bucket.firstAt > WINDOW_MS && now > bucket.lockedUntil;
    if (expired) buckets.delete(key);
  }
}

/**
 * Record a failed attempt.
 *
 * @returns The number of attempts left before lockout, for user feedback.
 */
export function recordFailure(key: string): number {
  const now = Date.now();
  prune(now);

  const existing = buckets.get(key);
  const bucket =
    existing && now - existing.firstAt <= WINDOW_MS
      ? existing
      : { count: 0, firstAt: now, lockedUntil: 0 };

  bucket.count += 1;

  if (bucket.count >= MAX_ATTEMPTS) {
    bucket.lockedUntil = now + LOCKOUT_MS;
  }

  if (buckets.size >= MAX_BUCKETS) {
    // Drop the oldest insertion rather than growing without bound.
    const oldest = buckets.keys().next();
    if (!oldest.done) buckets.delete(oldest.value);
  }

  buckets.set(key, bucket);

  return Math.max(0, MAX_ATTEMPTS - bucket.count);
}

/** Clear a bucket after a successful sign-in. */
export function recordSuccess(key: string): void {
  buckets.delete(key);
}

/** Milliseconds until the key is allowed to try again, or 0 when it may proceed. */
export function retryAfterMs(key: string): number {
  const bucket = buckets.get(key);

  if (!bucket) return 0;

  return Math.max(0, bucket.lockedUntil - Date.now());
}

/**
 * The rate-limit key for a sign-in attempt.
 *
 * Only the IP address is used. Folding the submitted email into the key would
 * let an attacker rotate emails to get a fresh allowance for the same source,
 * which defeats the limiter entirely.
 */
export function rateLimitKey(ip: string | undefined): string {
  return ip ?? 'unknown';
}
