/**
 * Simple in-memory sliding-window rate limiter — 100 req/min per user (PRD §7.2).
 * Single-instance only; swap for Redis when scaling horizontally (PRD §7.4).
 */
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, limit = 100, windowMs = 60_000): boolean {
  const now = Date.now()
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    buckets.set(key, recent)
    return false
  }
  recent.push(now)
  buckets.set(key, recent)
  return true
}
