import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

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
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
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

    // Check if company exists
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
    return NextResponse.json({ error: 'Failed to save company' }, { status: 500 })
  }
}
