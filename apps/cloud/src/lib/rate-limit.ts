/**
 * Simple in-memory sliding-window rate limiter — 100 req/min per key (PRD §7.2).
 *
 * LIMITATION (PRD §7.4): single-instance only. Behind multiple instances each
 * process keeps its own buckets, so the effective limit is N× the configured
 * value. Swap for a shared store (Redis / Upstash) before horizontal scaling.
 */
const buckets = new Map<string, number[]>()

/** Drop a bucket once it is empty so the map cannot grow unbounded. */
function prune(key: string, recent: number[], now: number, windowMs: number): number[] {
  const kept = recent.filter((t) => now - t < windowMs)
  if (kept.length === 0) {
    buckets.delete(key)
  } else {
    buckets.set(key, kept)
  }
  return kept
}

export function rateLimit(key: string, limit = 100, windowMs = 60_000): boolean {
  const now = Date.now()
  const recent = prune(key, buckets.get(key) ?? [], now, windowMs)
  if (recent.length >= limit) return false
  recent.push(now)
  buckets.set(key, recent)
  return true
}

/** Best-effort client identity for anonymous routes (register/login). */
export function clientKey(req: Request, prefix: string): string {
  const fwd = req.headers.get('x-forwarded-for')
  const ip = fwd ? fwd.split(',')[0]!.trim() : (req.headers.get('x-real-ip') ?? 'unknown')
  return `${prefix}:${ip}`
}
