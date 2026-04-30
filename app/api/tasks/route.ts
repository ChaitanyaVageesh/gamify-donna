import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { scoreTask } from '@/lib/gemini'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('company_id')
    const playerId = searchParams.get('player_id')
    const limit = parseInt(searchParams.get('limit') ?? '50')

    if (!companyId) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 })
    }

    const db = getServiceSupabase()
    let query = db
      .from('task_logs')
      .select('*, player:players(id,name,avatar_color), kpi:kpis(id,title,priority)')
      .eq('company_id', companyId)
      .order('task_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (playerId) query = query.eq('player_id', playerId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ tasks: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      player_id,
      kpi_id,
      company_id,
      task_date,
      title,
      description,
      contribution_type,
      time_spent_hours,
    } = body

    if (!player_id || !company_id || !title?.trim()) {
      return NextResponse.json({ error: 'player_id, company_id, and title required' }, { status: 400 })
    }

    const db = getServiceSupabase()

    // Fetch company, player, and KPI for scoring
    const [companyRes, playerRes, kpiRes] = await Promise.all([
      db.from('companies').select('*').eq('id', company_id).single(),
      db.from('players').select('*').eq('id', player_id).single(),
      kpi_id ? db.from('kpis').select('*').eq('id', kpi_id).single() : Promise.resolve({ data: null }),
    ])

    if (!companyRes.data || !playerRes.data) {
      return NextResponse.json({ error: 'Company or player not found' }, { status: 404 })
    }

    const scores = await scoreTask({
      company: companyRes.data,
      kpi: kpiRes.data,
      player: playerRes.data,
      taskTitle: title.trim(),
      taskDescription: description?.trim() || null,
      contributionType: contribution_type || 'direct',
      timeSpentHours: Number(time_spent_hours) || 1,
    })

    const { data, error } = await db
      .from('task_logs')
      .insert({
        player_id,
        kpi_id: kpi_id || null,
        company_id,
        task_date: task_date || new Date().toISOString().split('T')[0],
        title: title.trim(),
        description: description?.trim() || null,
        contribution_type: contribution_type || 'direct',
        time_spent_hours: Number(time_spent_hours) || 1,
        impact_score: scores.impact_score,
        effort_score: scores.effort_score,
        time_value_score: scores.time_value_score,
        total_score: scores.total_score,
        llm_feedback: scores.feedback,
        improvement_tip: scores.improvement_tip,
      })
      .select('*, player:players(id,name,avatar_color), kpi:kpis(id,title,priority)')
      .single()

    if (error) throw error

    return NextResponse.json({ task: data, scores })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
