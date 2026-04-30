import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function dbError(err: unknown, fallback: string) {
  const msg = (err as { message?: string })?.message ?? String(err)
  if (msg.includes('relation') || msg.includes('does not exist')) {
    return 'Database tables missing — run supabase/schema.sql in your Supabase SQL editor.'
  }
  if (msg.includes('Invalid API key') || msg.includes('JWT')) {
    return 'Invalid Supabase credentials — check SUPABASE_SERVICE_KEY in your environment variables.'
  }
  if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) {
    return 'Cannot reach Supabase — check NEXT_PUBLIC_SUPABASE_URL in your environment variables.'
  }
  return msg || fallback
}

export async function GET() {
  try {
    const db = getServiceSupabase()
    const { data, error } = await db
      .from('companies')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ company: null })
    }
    if (error) throw error

    return NextResponse.json({ company: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: dbError(err, 'Failed to fetch company') }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, state } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    const db = getServiceSupabase()

    const { data: existing } = await db.from('companies').select('id').limit(1).single()

    let company
    if (existing) {
      const { data, error } = await db
        .from('companies')
        .update({ name: name.trim(), description: description?.trim() || null, state })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      company = data
    } else {
      const { data, error } = await db
        .from('companies')
        .insert({ name: name.trim(), description: description?.trim() || null, state })
        .select()
        .single()
      if (error) throw error
      company = data
    }

    return NextResponse.json({ company })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: dbError(err, 'Failed to save company') }, { status: 500 })
  }
}
