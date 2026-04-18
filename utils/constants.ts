// ─── Chart Colors ────────────────────────────────────────────────────────────
// Mapped to CSS variables defined in globals.css
export const CHART_COLORS = {
  primary:   'hsl(var(--chart-1))',   // violet
  secondary: 'hsl(var(--chart-2))',   // emerald
  tertiary:  'hsl(var(--chart-3))',   // indigo
  warning:   'hsl(var(--chart-4))',   // amber
  danger:    'hsl(var(--chart-5))',   // rose
}

// ─── Spending Categories ──────────────────────────────────────────────────────
export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Medical',
  'Utilities',
  'Rent & Housing',
  'Salary & Income',
  'Subscriptions',
  'Education',
  'Travel',
  'Investments',
  'Others',
] as const

export type Category = (typeof CATEGORIES)[number]

// ─── Per-Category Colors ──────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining':    'hsl(var(--chart-1))',
  'Transportation':   'hsl(var(--chart-2))',
  'Shopping':         'hsl(var(--chart-3))',
  'Entertainment':    'hsl(var(--chart-4))',
  'Health & Medical': 'hsl(var(--chart-5))',
  'Utilities':        'hsl(262 60% 55%)',
  'Rent & Housing':   'hsl(173 45% 38%)',
  'Salary & Income':  'hsl(173 58% 45%)',
  'Subscriptions':    'hsl(346 60% 55%)',
  'Education':        'hsl(245 50% 58%)',
  'Travel':           'hsl(35 80% 55%)',
  'Investments':      'hsl(262 70% 60%)',
  'Others':           'hsl(0 0% 55%)',
}

// ─── Health Score Color ───────────────────────────────────────────────────────
export const HEALTH_SCORE_COLOR = (score: number): string => {
  if (score >= 71) return 'hsl(var(--chart-2))'  // emerald — good
  if (score >= 41) return 'hsl(var(--chart-4))'  // amber   — caution
  return 'hsl(var(--chart-5))'                    // rose    — danger
}

// ─── App-level Constants ──────────────────────────────────────────────────────
export const APP_NAME = 'FINN'
export const APP_TAGLINE = 'Your Personal CFO'
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const ALLOWED_FILE_TYPES = ['.csv', '.pdf', '.xlsx', '.xls'] as const
export const MAX_FILES_YEARLY = 12
export const MAX_FILES_OTHER = 3

// ─── Rate Limits ──────────────────────────────────────────────────────────────
export const RATE_LIMITS = {
  chat:     { requests: 20, windowMs: 60_000 },
  upload:   { requests: 10, windowMs: 60_000 },
  insights: { requests: 30, windowMs: 60_000 },
} as const
