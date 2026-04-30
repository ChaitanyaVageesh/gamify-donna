import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'
import { differenceInCalendarDays, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getServiceSupabase()
    const today = new Date().toISOString().split('T')[0]

    const { data: companies } = await db.from('companies').select('*')

    let sent = 0
    for (const company of companies ?? []) {
      const { data: players } = await db
        .from('players')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .not('email', 'is', null)

      for (const player of players ?? []) {
        // Check if they logged today
        const { data: todayLog } = await db
          .from('task_logs')
          .select('id')
          .eq('player_id', player.id)
          .eq('task_date', today)
          .limit(1)

        if (todayLog && todayLog.length > 0) continue

        // Find last log date
        const { data: lastLog } = await db
          .from('task_logs')
          .select('task_date')
          .eq('player_id', player.id)
          .order('task_date', { ascending: false })
          .limit(1)

        const daysUnlogged = lastLog?.[0]?.task_date
          ? differenceInCalendarDays(new Date(), parseISO(lastLog[0].task_date))
          : 1

        await sendReminderEmail(player, company, daysUnlogged)
        sent++
      }
    }

    return NextResponse.json({ sent })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
