import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: goals, error } = await supabase
      .from('goals')
      .select(`*, goal_progress(*)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get avg monthly savings for projection
    const { data: statements } = await supabase
      .from('statements')
      .select('total_income, total_expenses')
      .eq('user_id', user.id)
      .order('month', { ascending: false })
      .limit(3)

    const stmts = statements || []
    const avgMonthlySavings = stmts.length > 0
      ? stmts.reduce((s, m) =>
          s + (Number(m.total_income) - Number(m.total_expenses)), 0) / stmts.length
      : 0

    const enriched = (goals || []).map(goal => {
      const remaining = Number(goal.target_amount) - Number(goal.saved_amount)
      const progressPct = (Number(goal.saved_amount) / Number(goal.target_amount)) * 100

      // Project months to complete based on avg savings
      const monthsToComplete = avgMonthlySavings > 0
        ? remaining / avgMonthlySavings
        : null

      const projectedDate = monthsToComplete
        ? new Date(Date.now() + monthsToComplete * 30 * 24 * 60 * 60 * 1000)
            .toISOString().slice(0, 10)
        : null

      const targetDate = goal.target_date
      const onTrack = projectedDate && targetDate
        ? new Date(projectedDate) <= new Date(targetDate)
        : null

      return {
        ...goal,
        remaining,
        progressPct: Math.min(progressPct, 100),
        monthsToComplete,
        projectedDate,
        onTrack,
      }
    })

    return NextResponse.json({
      goals: enriched,
      avgMonthlySavings,
    })

  } catch (error) {
    console.error('[Goals GET] Error:', error)
    return NextResponse.json({ error: 'Failed to load goals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, target_amount, target_date, category } = body

    if (!title || !target_amount) {
      return NextResponse.json({ error: 'Title and target amount required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title,
        target_amount: Number(target_amount),
        saved_amount: 0,
        target_date: target_date || null,
        category: category || 'general',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ goal: data })

  } catch (error) {
    console.error('[Goals POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, saved_amount, is_completed } = body

    const { data, error } = await supabase
      .from('goals')
      .update({ saved_amount, is_completed: is_completed || false })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ goal: data })

  } catch (error) {
    console.error('[Goals PATCH] Error:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id)
    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
