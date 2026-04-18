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
