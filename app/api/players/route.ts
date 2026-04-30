import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { generateAvatarColor } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('company_id')

    if (!companyId) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 })
    }

    const db = getServiceSupabase()
    const { data, error } = await db
      .from('players')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ players: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_id, name, email } = body

    if (!company_id || !name?.trim()) {
      return NextResponse.json({ error: 'company_id and name required' }, { status: 400 })
    }

    const db = getServiceSupabase()
    const { data, error } = await db
      .from('players')
      .insert({
        company_id,
        name: name.trim(),
        email: email?.trim() || null,
        avatar_color: generateAvatarColor(name.trim()),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ player: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, email, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Player id required' }, { status: 400 })
    }

    const db = getServiceSupabase()
    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name.trim()
    if (email !== undefined) updates.email = email?.trim() || null
    if (is_active !== undefined) updates.is_active = is_active

    const { data, error } = await db
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ player: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}
