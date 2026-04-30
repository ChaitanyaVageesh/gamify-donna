import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('company_id')

    if (!companyId) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 })
    }

    const db = getServiceSupabase()

    // Fetch all players and all tasks in parallel
    const [playersRes, tasksRes, winnersRes] = await Promise.all([
      db.from('players').select('*').eq('company_id', companyId).eq('is_active', true).order('created_at'),
      db.from('task_logs').select('player_id,task_date,total_score').eq('company_id', companyId),
      db.from('weekly_winners')
        .select('*, player:players(name,avatar_color)')
        .eq('company_id', companyId)
        .order('week_end', { ascending: false })
        .limit(5),
    ])

    if (playersRes.error) throw playersRes.error
    if (tasksRes.error) throw tasksRes.error

    const players = playersRes.data ?? []
    const tasks = tasksRes.data ?? []

    const today = new Date()
    const weekAgo = format(subDays(today, 6), 'yyyy-MM-dd')
    const todayStr = format(today, 'yyyy-MM-dd')

    // Build per-player stats
    const leaderboard = players.map(player => {
      const playerTasks = tasks.filter(t => t.player_id === player.id)
      const totalScore = playerTasks.reduce((sum, t) => sum + (t.total_score || 0), 0)
      const weeklyScore = playerTasks
        .filter(t => t.task_date >= weekAgo && t.task_date <= todayStr)
        .reduce((sum, t) => sum + (t.total_score || 0), 0)

      // Daily scores for last 30 days
      const last30 = Array.from({ length: 30 }, (_, i) => {
        const date = format(subDays(today, 29 - i), 'yyyy-MM-dd')
        const score = playerTasks
          .filter(t => t.task_date === date)
          .reduce((sum, t) => sum + (t.total_score || 0), 0)
        return { date, score }
      })

      // Calculate streak (consecutive days logged up to today)
      let streak = 0
      for (let i = 0; i < 30; i++) {
        const checkDate = format(subDays(today, i), 'yyyy-MM-dd')
        const hasLog = playerTasks.some(t => t.task_date === checkDate)
        if (hasLog) {
          streak++
        } else if (i > 0) {
          break
        }
      }

      // Days since last log (for reminder logic)
      const sortedDates = playerTasks
        .map(t => t.task_date)
        .sort()
        .reverse()
      const lastLogDate = sortedDates[0]
      const daysUnlogged = lastLogDate
        ? differenceInCalendarDays(today, parseISO(lastLogDate))
        : 999

      return {
        player,
        total_score: Math.round(totalScore),
        weekly_score: Math.round(weeklyScore),
        task_count: playerTasks.length,
        streak,
        daily_scores: last30,
        days_unlogged: daysUnlogged,
        rank: 0,
      }
    })

    // Sort by total score and assign ranks
    leaderboard.sort((a, b) => b.total_score - a.total_score)
    leaderboard.forEach((entry, i) => { entry.rank = i + 1 })

    return NextResponse.json({
      leaderboard,
      past_winners: winnersRes.data ?? [],
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
