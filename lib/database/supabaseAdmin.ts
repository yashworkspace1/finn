import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '').trim() || 'https://placeholder.supabase.co'
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim() || 'placeholder-service-key'
  return createClient(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
