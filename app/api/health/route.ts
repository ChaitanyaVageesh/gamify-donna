import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_KEY)

  if (!url || url.includes('placeholder')) {
    return NextResponse.json({
      status: 'error',
      step: 'env',
      message: 'NEXT_PUBLIC_SUPABASE_URL is not set.',
      hint: 'Add your Supabase project URL to Vercel → Settings → Environment Variables, then redeploy.',
    })
  }

  if (!hasServiceKey) {
    return NextResponse.json({
      status: 'error',
      step: 'env',
      message: 'SUPABASE_SERVICE_KEY is not set.',
      hint: 'Add your Supabase service role key to Vercel → Settings → Environment Variables, then redeploy.',
    })
  }

  try {
    const db = getServiceSupabase()
    const { error } = await db.from('companies').select('id').limit(1)

    if (error) {
      const isTableMissing = error.message.includes('relation') || error.message.includes('does not exist')
      return NextResponse.json({
        status: 'error',
        step: 'schema',
        message: isTableMissing
          ? 'Database tables not found.'
          : `Database error: ${error.message}`,
        hint: isTableMissing
          ? 'Run the contents of supabase/schema.sql in your Supabase project → SQL Editor → New Query.'
          : 'Check your SUPABASE_SERVICE_KEY is the service_role key (not the anon key).',
        supabase_error: error.message,
      })
    }

    return NextResponse.json({ status: 'ok', url: url.replace(/https:\/\/(.{4}).*\.supabase\.co/, 'https://$1****.supabase.co') })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      step: 'connect',
      message: 'Could not reach Supabase.',
      hint: 'Verify NEXT_PUBLIC_SUPABASE_URL is a valid https://xxxx.supabase.co URL.',
      detail: String(err),
    })
  }
}
