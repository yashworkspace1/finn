// ─── Chart Colors ────────────────────────────────────────────────────────────
export const CHART_COLORS = [
  '#9b7fc4', // mauve
  '#f0a500', // amber
  '#4ecca3', // teal
  '#f472b6', // pink
  '#60a5fa', // blue
  '#fb923c', // orange
  '#a78bfa', // violet
  '#34d399', // emerald
  '#facc15', // yellow
  '#f87171', // red
  '#38bdf8', // sky
  '#c084fc', // purple
];

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
  'Food & Dining':    '#8b5cf6', // Violet
  'Transportation':   '#10b981', // Emerald
  'Shopping':         '#6366f1', // Indigo
  'Entertainment':    '#f59e0b', // Amber
  'Health & Medical': '#f43f5e', // Rose
  'Utilities':        '#06b6d4', // Cyan
  'Rent & Housing':   '#ec4899', // Pink
  'Salary & Income':  '#22c55e', // Green
  'Subscriptions':    '#d946ef', // Fuchsia
  'Education':        '#3b82f6', // Blue
  'Travel':           '#fb923c', // Orange
  'Investments':      '#14b8a6', // Teal
  'Others':           '#7c3aed', // Deep Violet (instead of gray)
}

// ─── Health Score Colors ─────────────────────────────────────────────────────
export const HEALTH_SCORE_COLORS = {
  good:    '#10b981', // emerald
  caution: '#f59e0b', // amber
  danger:  '#f43f5e', // rose
}

export const HEALTH_SCORE_COLOR = (score: number): string => {
  if (score >= 71) return HEALTH_SCORE_COLORS.good
  if (score >= 41) return HEALTH_SCORE_COLORS.caution
  return HEALTH_SCORE_COLORS.danger
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
