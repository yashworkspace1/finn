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
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 600,
      },
    })

    const historyText = history
      .slice(-8)
      .map(h => `${h.role === 'user' ? 'User' : 'FINN'}: ${h.message}`)
      .join('\n')

    const topCats = (context.topCategories || [])
      .slice(0, 5)
      .map((c: any) =>
        `  - ${c.category}: ₹${c.amount?.toLocaleString('en-IN')} (${c.percentage?.toFixed(1)}%)`
      )
      .join('\n')

    const recent = (context.recentTransactions || [])
      .slice(0, 5)
      .map((t: any) =>
        `  - ${t.date}: ${t.description} · ${t.type === 'credit' ? '+' : '-'}₹${t.amount?.toLocaleString('en-IN')}`
      )
      .join('\n')

    const prompt = `You are FINN, an elite AI financial advisor. You are warm, sharp, specific, and genuinely helpful. You talk like a knowledgeable friend who happens to be a CFO — never robotic, never generic.

STYLE RULES:
- Keep responses 2-4 sentences for simple questions, up to 6 for complex ones
- Use specific numbers from user's data (not generic advice)
- Use Indian Rupee ₹ format with commas (en-IN locale)
- Use markdown: **bold** for emphasis, bullet points for lists
- Match user's tone — casual stays casual
- Never say "I don't know" — always offer something actionable
- If user asks general finance questions, answer as a real expert
- Use emojis sparingly (1-2 per response max)

USER'S FINANCIAL DATA:

Overview:
- Total Income: ₹${context.totalIncome?.toLocaleString('en-IN') || 0}
- Total Expenses: ₹${context.totalExpenses?.toLocaleString('en-IN') || 0}
- Savings Rate: ${context.savingsRate?.toFixed(1) || 0}%
- Health Score: ${context.healthScore || 0}/100
- Anomalies Detected: ${context.anomalyCount || 0}
- Active Subscriptions: ${context.subscriptionCount || 0}
- Total Transactions: ${context.transactionCount || 0}
- Date Range: ${context.dateRange?.from || 'N/A'} to ${context.dateRange?.to || 'N/A'}

Top Spending Categories:
${topCats || '  (No data yet — ask user to upload a statement)'}

Recent Transactions:
${recent || '  (No recent data)'}

CONVERSATION SO FAR:
${historyText || '(Start of conversation)'}

USER'S QUESTION: ${message}

FINN:`

    const result = await model.generateContent(prompt)
    let response = result.response.text().trim()

    // Clean up any artifacts
    response = response
      .replace(/^FINN:\s*/i, '')
      .replace(/^Assistant:\s*/i, '')
      .trim()

    if (response.length < 20) throw new Error('Response too short')

    return response

  } catch (error: any) {
    console.error('Gemini chat error:', error.message)
    throw error
  }
}

export async function extractTransactionsWithAI(text: string): Promise<any[]> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash' 
    })
    
    // To avoid hitting output limits on huge statements, we'll ask it to be concise
    const prompt = `
You are a highly accurate financial data extraction AI.
I am providing you with the raw text extracted from a bank statement PDF.
Your job is to find all the actual transactions and extract them into a clean JSON array.

Guidelines:
1. Ignore page numbers, headers, bank addresses, opening balances, closing balances, and footer notes.
2. For each transaction, extract:
   - "date": format as YYYY-MM-DD. If the year is missing, infer it from the statement or use the current year.
   - "description": clean up the text (remove excessive spaces, reference numbers if they clutter).
   - "amount": a positive number (float).
   - "type": "credit" (money in/deposit) or "debit" (money out/withdrawal).

Raw PDF Text:
---
${text.substring(0, 30000)}
---

Respond with ONLY a valid JSON array of objects, no markdown blocks, no explanation.
Example output:
[
  { "date": "2023-10-01", "description": "AMAZON RETAIL", "amount": 120.50, "type": "debit" },
  { "date": "2023-10-03", "description": "SALARY CREDIT", "amount": 5000.00, "type": "credit" }
]`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Clean response by extracting only the JSON array
    const match = responseText.match(/\[[\s\S]*\]/)
    const clean = match ? match[0] : responseText
      
    const parsed = JSON.parse(clean)
    
    if (!Array.isArray(parsed)) {
      throw new Error('AI did not return a JSON array')
    }
    
    return parsed
    
  } catch (error: any) {
    console.error('Gemini extraction error:', error.message)
    throw new Error('Failed to parse transactions via AI: ' + error.message)
  }
}
