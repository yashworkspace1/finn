import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
)

export async function generateInsights(
  stats: any
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash' 
    })
    
    const prompt = `
You are FINN, an AI financial advisor.
Analyze this financial data and respond with ONLY valid JSON, no markdown, no explanation.

Data:
- Monthly Average Income: ₹${stats.monthlyIncome}
- Monthly Average Expenses: ₹${stats.monthlyExpenses}
- Savings Rate: ${stats.savingsRate}%
- Health Score: ${stats.healthScore}/100
- Personality: ${stats.personality}
- Top Categories: ${JSON.stringify(stats.topCategories)}
- Date Range: ${stats.dateRange?.from} to ${stats.dateRange?.to}
- Transactions: ${stats.transactionCount}

Respond with ONLY this JSON structure:
{
  "summary": "2-3 sentence overview focused ONLY on monthly flow",
  "insights": [
    {
      "title": "insight title",
      "description": "actionable description (proportional to monthly income - NEVER suggest saving more than the monthly income)",
      "type": "positive|warning|danger|info"
    }
  ],
  "weeklyNudge": "one specific tip (MUST be a small, realistic fraction of monthly income, e.g. 'Save ₹2,000')",
  "savingOpportunity": "one saving tip"
}

CRITICAL: The user earns ₹${stats.monthlyIncome} per month. NEVER suggest saving amounts larger than this. All amounts must be realistic for a single month.

Maximum 3 insights. Be specific with Indian Rupee amounts. Return ONLY JSON.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    // Clean response
    const clean = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    const parsed = JSON.parse(clean)
    
    // Validate structure
    if (!parsed.summary || !parsed.insights) {
      throw new Error('Invalid response structure')
    }
    
    return parsed
    
  } catch (error: any) {
    console.error('Gemini error:', error.message)
    throw error
  }
}

export async function chatWithGemini(
  message: string,
  context: any,
  history: any[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash' 
    })
    
    const historyText = history
      .slice(-6)
      .map(h => `${h.role === 'user' ? 'User' : 'FINN'}: ${h.message}`)
      .join('\n')
    
    const prompt = `
You are FINN, a friendly financial advisor.
Answer in 2-4 sentences. Be specific and helpful.
Use Indian Rupee ₹ for amounts.

User's Financial Context:
- Income: ₹${context.totalIncome?.toLocaleString('en-IN')}
- Expenses: ₹${context.totalExpenses?.toLocaleString('en-IN')}
- Savings Rate: ${context.savingsRate?.toFixed(1)}%
- Health Score: ${context.healthScore}/100
- Top Category: ${context.topCategories?.[0]?.category} (₹${context.topCategories?.[0]?.amount?.toLocaleString('en-IN')})

Recent conversation:
${historyText}

User: ${message}
FINN:`
    
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
    
  } catch (error: any) {
    console.error('Gemini chat error:', error.message)
    throw error
  }
}
