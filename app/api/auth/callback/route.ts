import { createClient } from '@/lib/database/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if returning user
        const { count } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        
        if (count && count > 0) {
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
