const buckets = new Map<string, { count: number; resetAt: number }>()
const MAX_BUCKETS = 10_000

function pruneBuckets(now: number): void {
  if (buckets.size < MAX_BUCKETS) return
  for (const [k, b] of buckets) {
    if (now > b.resetAt) buckets.delete(k)
    if (buckets.size < MAX_BUCKETS * 0.8) break
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now()
  pruneBuckets(now)
  let bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }
  bucket.count++
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true }
}

export function clientKey(req: Request, suffix: string): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded || realIp || 'unknown'
  return `${ip}:${suffix}`
}
