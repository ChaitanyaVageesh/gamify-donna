import { createClient } from '@supabase/supabase-js'

// Fallback placeholder URL passes Supabase validation at build time;
// real requests will fail gracefully if env vars are not set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_KEY ?? 'placeholder-service-key'
  return createClient(url, key, { auth: { persistSession: false } })
}
