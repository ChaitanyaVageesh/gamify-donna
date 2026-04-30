import { createClient } from '@supabase/supabase-js'

// Use || (not ??) so empty-string env vars also fall back to the placeholder.
// The placeholder is a valid HTTPS URL that passes Supabase's validation at
// build time; real DB calls will fail gracefully if env vars are not configured.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY
)

export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
    process.env.SUPABASE_SERVICE_KEY || PLACEHOLDER_KEY,
    { auth: { persistSession: false } }
  )
}
