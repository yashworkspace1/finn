import { createClient } from '@/lib/database/supabaseServer'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '500', 10)

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ 
    transactions: data || [],
    count: data?.length || 0
  })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const uid = user.id

  // Clear ALL user data — full reset
  const tables = [
    'transactions',
    'statements',
    'recurring_bills',
    'insights',
    'goals',
    'goal_progress',
    'merchant_profiles',
    'cashflow',
    'chat_history',
    'comparisons',
  ]

  const results = await Promise.allSettled(
    tables.map(table =>
      supabase.from(table).delete().eq('user_id', uid)
    )
  )

  const failures = results
    .map((r, i) => r.status === 'rejected' ? tables[i] : null)
    .filter(Boolean)

  if (failures.length > 0) {
    console.warn('[Clear Data] Some tables failed to clear:', failures)
  }

  return Response.json({ success: true, cleared: tables })
}
