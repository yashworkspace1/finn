import { createClient } from '@/lib/database/supabaseServer'
import { createAdminClient } from '@/lib/database/supabaseAdmin'
import { chatWithGemini } from '@/lib/ai/gemini'
import { generateFallbackChatResponse } from '@/lib/ai/fallback'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { calculateHealthScore } from '@/lib/engine/scorer'
import { getTotalIncome, getTotalExpenses, getSavingsRate, getTopCategories } from '@/lib/engine/stats'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20)

    return Response.json({ messages: data || [] })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const rateLimit = checkRateLimit(`chat:${user.id}`, 20)
    if (!rateLimit.allowed) {
      return Response.json({ error: 'Too many messages. Wait a minute.' }, { status: 429 })
    }

    const { message } = await request.json()
    if (!message?.trim()) {
      return Response.json({ error: 'Message required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { data: transactions } = await adminSupabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10000)

    const txns = transactions || []
    const health = calculateHealthScore(txns)

    const context = {
      totalIncome: getTotalIncome(txns),
      totalExpenses: getTotalExpenses(txns),
      savingsRate: getSavingsRate(txns),
      topCategories: getTopCategories(txns, 10),
      healthScore: health.score,
      healthGrade: health.grade,
      anomalyCount: txns.filter(t => t.is_anomaly).length,
      subscriptionCount: txns.filter(t => t.is_subscription).length,
      recentTransactions: txns.slice(0, 10),
      transactionCount: txns.length,
      dateRange: {
        from: txns[txns.length - 1]?.date,
        to: txns[0]?.date,
      },
    }

    const { data: history } = await supabase
      .from('chat_history')
      .select('role, message')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6)

    await supabase.from('chat_history').insert({
      user_id: user.id,
      role: 'user',
      message: message.trim()
    })

    let response: string
    try {
      response = await chatWithGemini(message, context, (history || []).reverse())
    } catch {
      response = generateFallbackChatResponse(message, context)
    }

    await supabase.from('chat_history').insert({
      user_id: user.id,
      role: 'assistant',
      message: response
    })

    return Response.json({ response })

  } catch (error: any) {
    console.error('Chat error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', user.id)

    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
