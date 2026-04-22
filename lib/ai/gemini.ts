import { GoogleGenerativeAI } from '@google/generative-ai'

// Multiple API keys — each has its own free quota
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[]

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.0-flash',
]

function isRateLimitError(error: any): boolean {
  return (
    error?.message?.includes('429') ||
    error?.message?.includes('quota') ||
    error?.message?.includes('Too Many Requests') ||
    error?.message?.includes('RESOURCE_EXHAUSTED')
  )
}

async function tryWithFallback<T>(
  fn: (model: any) => Promise<T>
): Promise<T> {
  let lastError: any

  for (const apiKey of API_KEYS) {
    for (const modelName of GEMINI_MODELS) {
      try {
        const client = new GoogleGenerativeAI(apiKey)
        const model = client.getGenerativeModel({ model: modelName })
        console.log(`[Gemini] Trying ${modelName} with key ...${apiKey.slice(-6)}`)
        const result = await fn(model)
        console.log(`[Gemini] ✅ Success with ${modelName}`)
        return result
      } catch (error: any) {
        if (isRateLimitError(error)) {
          console.warn(`[Gemini] ⚠️ Rate limited: ${modelName} on key ...${apiKey.slice(-6)}`)
          lastError = error
          continue
        }
        throw error
      }
    }
  }

  throw lastError
}

export async function generateInsights(stats: any): Promise<any> {
  return tryWithFallback(async (model) => {
    const prompt = `
You are FINN, an AI financial advisor.
Analyze this financial data and respond with ONLY valid JSON.

Data:
- Monthly Average Income: ₹${stats.monthlyIncome}
- Monthly Average Expenses: ₹${stats.monthlyExpenses}
- Savings Rate: ${stats.savingsRate}%
- Health Score: ${stats.healthScore}/100
- Personality: ${stats.personality}
- Top Categories: ${JSON.stringify(stats.topCategories)}
- Date Range: ${stats.dateRange?.from} to ${stats.dateRange?.to}
- Transactions: ${stats.transactionCount}

Respond with ONLY this JSON:
{
  "summary": "2-3 sentence overview",
  "insights": [
    {
      "title": "insight title",
      "description": "actionable description",
      "type": "positive|warning|danger|info"
    }
  ],
  "weeklyNudge": "one specific tip",
  "savingOpportunity": "one saving tip"
}

Maximum 3 insights. Indian Rupee amounts. Return ONLY JSON.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.summary || !parsed.insights) throw new Error('Invalid structure')
    return parsed
  })
}

export async function chatWithGemini(
  message: string,
  context: any,
  history: any[]
): Promise<string> {
  return tryWithFallback(async (model) => {
    const historyText = history
      .slice(-8)
      .map(h => `${h.role === 'user' ? 'User' : 'FINN'}: ${h.message}`)
      .join('\n')

    const topCats = (context.topCategories || [])
      .slice(0, 5)
      .map((c: any) =>
        `  - ${c.category}: ₹${c.amount?.toLocaleString('en-IN')} (${c.percentage?.toFixed(1)}%)`
      ).join('\n')

    const recent = (context.recentTransactions || [])
      .slice(0, 5)
      .map((t: any) =>
        `  - ${t.date}: ${t.description} · ${t.type === 'credit' ? '+' : '-'}₹${t.amount?.toLocaleString('en-IN')}`
      ).join('\n')

    const prompt = `You are FINN, an elite AI financial advisor. Warm, sharp, specific.

RULES:
- 2-4 sentences for simple questions, up to 6 for complex
- Use specific ₹ numbers from user data
- Use markdown bold for emphasis
- Never say "I don't know"
- Max 2 emojis per response

USER DATA:
- Income: ₹${context.totalIncome?.toLocaleString('en-IN') || 0}
- Expenses: ₹${context.totalExpenses?.toLocaleString('en-IN') || 0}
- Savings Rate: ${context.savingsRate?.toFixed(1) || 0}%
- Health Score: ${context.healthScore || 0}/100
- Anomalies: ${context.anomalyCount || 0}
- Subscriptions: ${context.subscriptionCount || 0}

Top Categories:
${topCats || '(No data yet)'}

Recent Transactions:
${recent || '(No data)'}

Conversation:
${historyText || '(Start)'}

User: ${message}
FINN:`

    const result = await model.generateContent(prompt)
    let response = result.response.text().trim()
    response = response.replace(/^FINN:\s*/i, '').replace(/^Assistant:\s*/i, '').trim()
    if (response.length < 20) throw new Error('Response too short')
    return response
  })
}

export async function extractTransactionsWithAI(text: string): Promise<any[]> {
  return tryWithFallback(async (model) => {
    const prompt = `
You are a financial data extraction AI.
Extract all transactions from this bank statement into a JSON array.

Rules:
1. Ignore headers, page numbers, opening/closing balances
2. Each transaction: date (YYYY-MM-DD), description, amount (positive), type (credit/debit)

Text:
---
${text.substring(0, 30000)}
---

Respond ONLY with a valid JSON array. No markdown. No explanation.
Example: [{"date":"2023-10-01","description":"AMAZON","amount":120.50,"type":"debit"}]`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const match = responseText.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found')
    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    return parsed
  })
}

export async function generateCFOMemo(comparison: {
  monthA: string
  monthB: string
  incomeA: number
  incomeB: number
  expensesA: number
  expensesB: number
  savingsRateA: number
  savingsRateB: number
  categoryDeltas: Array<{ category: string; amountA: number; amountB: number; delta: number; percentChange: number }>
  newMerchants: string[]
  droppedMerchants: string[]
  topSpike: { category: string; delta: number } | null
}): Promise<{ memo: string; verdict: 'better' | 'worse' | 'stable'; score: number }> {
  return tryWithFallback(async (model) => {
    const prompt = `
You are FINN, an elite AI CFO advisor.

COMPARISON:
Month A: ${comparison.monthA} → Month B: ${comparison.monthB}
Income: ₹${comparison.incomeA.toLocaleString('en-IN')} → ₹${comparison.incomeB.toLocaleString('en-IN')}
Expenses: ₹${comparison.expensesA.toLocaleString('en-IN')} → ₹${comparison.expensesB.toLocaleString('en-IN')}
Savings Rate: ${comparison.savingsRateA.toFixed(1)}% → ${comparison.savingsRateB.toFixed(1)}%

Category Changes:
${comparison.categoryDeltas.slice(0, 6).map(c =>
  `- ${c.category}: ₹${c.amountA.toLocaleString('en-IN')} → ₹${c.amountB.toLocaleString('en-IN')} (${c.delta >= 0 ? '+' : ''}₹${c.delta.toLocaleString('en-IN')})`
).join('\n')}

New merchants: ${comparison.newMerchants.slice(0, 5).join(', ') || 'none'}
Dropped merchants: ${comparison.droppedMerchants.slice(0, 5).join(', ') || 'none'}
Biggest spike: ${comparison.topSpike ? `${comparison.topSpike.category} (+₹${comparison.topSpike.delta.toLocaleString('en-IN')})` : 'none'}

Write a 3-4 sentence CFO memo with exact ₹ amounts and one actionable recommendation.

Respond ONLY with this JSON:
{
  "memo": "your memo here",
  "verdict": "better|worse|stable",
  "score": 0-100
}

ONLY JSON. No markdown. No extra text.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      memo: parsed.memo || 'Unable to generate memo.',
      verdict: parsed.verdict || 'stable',
      score: parsed.score || 50,
    }
  })
}
