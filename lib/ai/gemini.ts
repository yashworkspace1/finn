import { GoogleGenerativeAI } from '@google/generative-ai'
import { PROMPTS } from '@/lib/ai/prompts'
import { GeminiInsights, generateFallbackInsights } from '@/lib/ai/fallback'
import { Transaction } from '@/lib/parser/normalizer'
import { getTopCategories, getTotalIncome, getTotalExpenses, getSavingsRate } from '@/lib/engine/stats'

// ─── Initialise client (server-side only — key never exposed to browser) ──────
function getModel() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

// ─── Clean Gemini response (strip markdown fences if present) ────────────────
function cleanJSON(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

// ─── Generate insights ────────────────────────────────────────────────────────
export async function generateInsights(
  transactions: Transaction[],
  stats: {
    totalIncome: number
    totalExpenses: number
    savingsRate: number
    anomalyCount: number
    topCategories: { category: string; amount: number; percentage: number }[]
  }
): Promise<string> {
  const model = getModel()
  const topCats = getTopCategories(transactions, 5)

  const prompt = PROMPTS.generateInsights({
    totalIncome: stats.totalIncome,
    totalExpenses: stats.totalExpenses,
    savingsRate: stats.savingsRate,
    topCategories: topCats,
    anomalyCount: stats.anomalyCount,
    subscriptionCount: transactions.filter((t) => (t as { is_subscription?: boolean }).is_subscription).length,
    healthScore: 0, // passed externally
    personality: '',
    transactionCount: transactions.length,
    dateRange: {
      from: transactions[0]?.date ?? '',
      to: transactions[transactions.length - 1]?.date ?? '',
    },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}

// ─── Generate full insights object (parsed JSON) ──────────────────────────────
export async function generateInsightsJSON(
  transactions: Transaction[],
  stats: Parameters<typeof generateInsights>[1] & {
    healthScore: number
    personality: string
    subscriptionCount?: number
  }
): Promise<GeminiInsights> {
  const model = getModel()
  const topCats = stats.topCategories.length ? stats.topCategories : getTopCategories(transactions, 5)

  const prompt = PROMPTS.generateInsights({
    totalIncome: stats.totalIncome,
    totalExpenses: stats.totalExpenses,
    savingsRate: stats.savingsRate,
    topCategories: topCats,
    anomalyCount: stats.anomalyCount,
    subscriptionCount: stats.subscriptionCount ?? 0,
    healthScore: stats.healthScore,
    personality: stats.personality,
    transactionCount: transactions.length,
    dateRange: {
      from: transactions[0]?.date ?? '',
      to: transactions[transactions.length - 1]?.date ?? '',
    },
  })

  const result = await model.generateContent(prompt)
  const text = cleanJSON(result.response.text())
  return JSON.parse(text) as GeminiInsights
}

// ─── Weekly nudge ─────────────────────────────────────────────────────────────
export async function generateNudge(context: {
  healthScore: { score: number }
  personality: { type: string }
  topCategories: { category: string }[]
}): Promise<string> {
  const model = getModel()
  const prompt = PROMPTS.generateNudge(
    context.healthScore.score,
    context.personality.type,
    context.topCategories[0]?.category ?? 'general spending'
  )
  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ─── FinChat Q&A ──────────────────────────────────────────────────────────────
export async function chatWithData(
  message: string,
  transactions: Transaction[],
  history: { role: string; message: string }[]
): Promise<string> {
  const model = getModel()

  const totalIncome   = getTotalIncome(transactions)
  const totalExpenses = getTotalExpenses(transactions)
  const savingsRate   = getSavingsRate(transactions)
  const topCats       = getTopCategories(transactions, 5)

  const prompt = PROMPTS.chatWithData(
    message,
    {
      totalIncome,
      totalExpenses,
      savingsRate,
      topCategories: topCats,
      healthScore: 0,
      recentTransactions: transactions
        .slice(-5)
        .map((t) => ({ date: t.date, description: t.description, amount: t.amount, type: t.type })),
    },
    history
  )

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ─── Fallback-aware wrappers (used by API routes) ─────────────────────────────
export async function generateInsightsWithFallback(
  transactions: Transaction[],
  stats: Parameters<typeof generateInsightsJSON>[1]
): Promise<GeminiInsights> {
  try {
    return await generateInsightsJSON(transactions, stats)
  } catch {
    return generateFallbackInsights(stats)
  }
}

export async function chatWithFallback(
  message: string,
  transactions: Transaction[],
  history: { role: string; message: string }[]
): Promise<string> {
  try {
    return await chatWithData(message, transactions, history)
  } catch {
    const totalIncome   = getTotalIncome(transactions)
    const totalExpenses = getTotalExpenses(transactions)
    const savingsRate   = getSavingsRate(transactions)
    const topCats       = getTopCategories(transactions, 3)

    // Smart rule-based fallback chat responses
    const q = message.toLowerCase()
    if (q.includes('spent') || q.includes('spend') || q.includes('most')) {
      return `Based on your data, your top spending category is ${topCats[0]?.category ?? 'Others'} at ₹${topCats[0]?.amount.toLocaleString('en-IN') ?? 0}. Your total expenses were ₹${totalExpenses.toLocaleString('en-IN')} with a ${savingsRate}% savings rate.`
    }
    if (q.includes('income') || q.includes('earn')) {
      return `Your total income recorded is ₹${totalIncome.toLocaleString('en-IN')}. After expenses of ₹${totalExpenses.toLocaleString('en-IN')}, you saved ₹${(totalIncome - totalExpenses).toLocaleString('en-IN')}.`
    }
    if (q.includes('save') || q.includes('saving')) {
      return `Your current savings rate is ${savingsRate}%. ${savingsRate >= 20 ? "That's excellent — above the recommended 20%!" : "Try to target 20% by reducing discretionary spending."}`
    }
    return `Your financial summary: Income ₹${totalIncome.toLocaleString('en-IN')}, Expenses ₹${totalExpenses.toLocaleString('en-IN')}, Savings Rate ${savingsRate}%. Top spend: ${topCats[0]?.category ?? 'N/A'}. Ask me anything specific about your finances!`
  }
}
