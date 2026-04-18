const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}

// ─── Preset rate limiters ─────────────────────────────────────────────────────
export const chatRateLimit    = (userId: string) => checkRateLimit(`chat:${userId}`,     20, 60_000)
export const uploadRateLimit  = (userId: string) => checkRateLimit(`upload:${userId}`,   10, 60_000)
export const insightsRateLimit = (userId: string) => checkRateLimit(`insights:${userId}`, 30, 60_000)
