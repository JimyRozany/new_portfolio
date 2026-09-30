'server-only';

/**
 * Throttle for the public contact form.
 *
 * Separate from the admin login limiter on purpose: login lockout is
 * *punitive* (a few failures and you are locked out for a while), whereas a
 * contact form should merely slow down a spammer without getting a real person
 * in trouble for sending a second message.
 *
 * The same single-process caveat as the login limiter applies: counters are
 * per-instance, so a horizontally scaled deployment multiplies the effective
 * limit. See `src/server/auth/rate-limit.ts` for the Redis swap when that day
 * comes.
 */

/** Messages allowed per window, per client. */
const MAX_MESSAGES = 5;

/** Rolling window. */
const WINDOW_MS = 10 * 60 * 1000;

/** Cap on tracked clients so unique keys cannot grow the map without bound. */
const MAX_BUCKETS = 5_000;

type Bucket = { count: number; firstAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.firstAt > WINDOW_MS) buckets.delete(key);
  }
}

/** Normalise a client address so `X-Forwarded-For` cannot be used to evade. */
export function clientKey(rawAddress: string | null): string {
  if (!rawAddress) return 'unknown';

  // Only the first hop is the client; the rest are proxies.
  const address = rawAddress.split(',')[0]?.trim();
  if (!address) return 'unknown';

  // Normalise IPv4-mapped IPv6 (`::ffff:1.2.3.4`) to its IPv4 form.
  return address.replace(/^::ffff:/, '');
}

/**
 * @returns Milliseconds until the next message is allowed, or `0` if one is
 *   allowed now.
 */
export function throttle(key: string): number {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);

  // No bucket, or the window has rolled over: a message is allowed.
  if (!bucket || now - bucket.firstAt > WINDOW_MS) return 0;

  return bucket.count >= MAX_MESSAGES ? Math.max(0, bucket.firstAt + WINDOW_MS - now) : 0;
}

/** Record an accepted message. */
export function recordMessage(key: string): void {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);

  if (!bucket || now - bucket.firstAt > WINDOW_MS) {
    if (buckets.size >= MAX_BUCKETS) {
      // Shed the oldest bucket rather than refusing service.
      const oldest = buckets.keys().next();
      if (!oldest.done) buckets.delete(oldest.value);
    }

    buckets.set(key, { count: 1, firstAt: now });
    return;
  }

  bucket.count += 1;
}
