import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { sendWeeklyWinnerEmail } from '@/lib/email'
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getServiceSupabase()
    const now = new Date()
    const weekStart = format(startOfWeek(subDays(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(subDays(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd')

    const { data: companies } = await db.from('companies').select('*')

    for (const company of companies ?? []) {
      // Get all task scores for this week
      const { data: tasks } = await db
        .from('task_logs')
        .select('player_id, total_score')
        .eq('company_id', company.id)
        .gte('task_date', weekStart)
        .lte('task_date', weekEnd)

      if (!tasks || tasks.length === 0) continue

      // Aggregate by player
      const scoreMap: Record<string, number> = {}
      for (const task of tasks) {
        scoreMap[task.player_id] = (scoreMap[task.player_id] || 0) + task.total_score
      }

      const winnerId = Object.entries(scoreMap).sort((a, b) => b[1] - a[1])[0]?.[0]
      if (!winnerId) continue

      const { data: winnerPlayer } = await db.from('players').select('*').eq('id', winnerId).single()
      if (!winnerPlayer) continue

      // Save winner
      const { data: winnerRecord } = await db
        .from('weekly_winners')
        .insert({
          player_id: winnerId,
          company_id: company.id,
          week_start: weekStart,
          week_end: weekEnd,
          total_score: scoreMap[winnerId],
        })
        .select()
        .single()

      if (!winnerRecord) continue

      const { data: allPlayers } = await db
        .from('players')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)

      await sendWeeklyWinnerEmail(
        { ...winnerRecord, player: winnerPlayer },
        allPlayers ?? [],
        company
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Weekly winner cron failed' }, { status: 500 })
  }
}
