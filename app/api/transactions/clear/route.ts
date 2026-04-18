import { createClient } from '@/lib/database/supabaseServer'
import { createAdminClient } from '@/lib/database/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    
    // Delete all transactions for the user
    const { error: deleteError } = await adminSupabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      throw deleteError
    }

    // Also clear the insights cache if any
    await adminSupabase
      .from('ai_insights_cache')
      .delete()
      .eq('user_id', user.id)

    return Response.json({ success: true, message: 'Data cleared successfully' })
  } catch (error: any) {
    console.error('Clear data error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
