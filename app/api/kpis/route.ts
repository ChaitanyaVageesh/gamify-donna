import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { suggestKPIs } from '@/lib/gemini'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('company_id')
    const suggest = searchParams.get('suggest')

    if (!companyId) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 })
    }

    const db = getServiceSupabase()

    const { data: kpis, error } = await db
      .from('kpis')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (error) throw error

    if (suggest === 'true') {
      const { data: company } = await db
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      const suggestions = company ? await suggestKPIs(company, kpis ?? []) : null
      return NextResponse.json({ kpis, suggestions })
    }

    return NextResponse.json({ kpis })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_id, title, description, target_value, unit, priority, frequency, start_date, end_date } = body

    if (!company_id || !title?.trim()) {
      return NextResponse.json({ error: 'company_id and title required' }, { status: 400 })
    }

    const db = getServiceSupabase()
    const { data, error } = await db
      .from('kpis')
      .insert({
        company_id,
        title: title.trim(),
        description: description?.trim() || null,
        target_value: Number(target_value) || 100,
        unit: unit?.trim() || '%',
        priority: Number(priority) || 1,
        frequency: frequency || 'weekly',
        start_date: start_date || new Date().toISOString().split('T')[0],
        end_date: end_date || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ kpi: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create KPI' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'KPI id required' }, { status: 400 })
    }

    const db = getServiceSupabase()
    const { data, error } = await db
      .from('kpis')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ kpi: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update KPI' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'KPI id required' }, { status: 400 })
    }

    const db = getServiceSupabase()
    const { error } = await db
      .from('kpis')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete KPI' }, { status: 500 })
  }
}
