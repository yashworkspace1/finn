import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'
import { chatRateLimit } from '@/lib/security/rateLimit'
import { chatWithFallback } from '@/lib/ai/gemini'
import { categorizeTransactions } from '@/lib/engine/categorizer'

export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── Rate limit ──────────────────────────────────────────────────────────
    const { allowed } = chatRateLimit(user.id)
    if (!allowed) return NextResponse.json({ error: 'Rate limit: 20 messages per minute.' }, { status: 429 })

    // ── Parse request body ──────────────────────────────────────────────────
    const body = await request.json()
    const message: string = body.message?.slice(0, 500) ?? ''
    if (!message.trim()) return NextResponse.json({ error: 'Message is required.' }, { status: 400 })

    // ── Fetch transactions ──────────────────────────────────────────────────
    const { data: rawTxns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    const transactions = categorizeTransactions(rawTxns ?? [])

    // ── Fetch last 10 chat messages for context ─────────────────────────────
    const { data: historyRows } = await supabase
      .from('chat_history')
      .select('role, message')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const history = (historyRows ?? []).reverse()

    // ── Call Gemini (with fallback) ─────────────────────────────────────────
    const reply = await chatWithFallback(message, transactions, history)

    // ── Save both messages to chat_history ──────────────────────────────────
    await supabase.from('chat_history').insert([
      { user_id: user.id, role: 'user',      message: message },
      { user_id: user.id, role: 'assistant', message: reply   },
    ])

    return NextResponse.json({ success: true, reply })
  } catch (err) {
    console.error('Chat route error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// Clear chat history
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase.from('chat_history').delete().eq('user_id', user.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Chat DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
