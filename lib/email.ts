import { Resend } from 'resend'
import type { Player, Company, WeeklyWinner } from './types'

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const from = process.env.RESEND_FROM_EMAIL || 'noreply@example.com'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendReminderEmail(player: Player, company: Company, daysUnlogged: number) {
  const resend = getResend()
  if (!resend || !player.email) return

  const subject = daysUnlogged > 1
    ? `⏰ ${player.name}, you have ${daysUnlogged} days to log!`
    : `⚡ Don't forget to log today's wins, ${player.name}!`

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="background:#09090b;color:#f4f4f5;font-family:system-ui,sans-serif;padding:32px;margin:0">
      <div style="max-width:500px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="margin:0;font-size:28px">⚡ WorkQuest</h1>
          <p style="margin:8px 0 0;opacity:0.9">${company.name}</p>
        </div>
        <div style="background:#13131f;border-radius:12px;padding:24px;border:1px solid #1e1e30">
          <h2 style="margin:0 0 12px;color:#a78bfa">Hey ${player.name}!</h2>
          <p style="color:#a1a1aa;margin:0 0 16px">
            ${daysUnlogged > 1
              ? `You haven't logged your work for <strong style="color:#f59e0b">${daysUnlogged} days</strong>. You can log retroactively — don't lose those points!`
              : "The day is almost done. Log your wins and climb the leaderboard!"
            }
          </p>
          <a href="${appUrl}/log" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
            Log My Work →
          </a>
        </div>
        <p style="text-align:center;color:#3f3f46;font-size:12px;margin-top:16px">
          WorkQuest · ${company.name} · <a href="${appUrl}" style="color:#7c3aed">Open Dashboard</a>
        </p>
      </div>
    </body>
    </html>
  `

  try {
    await resend.emails.send({ from, to: player.email, subject, html })
  } catch (err) {
    console.error(`Failed to send reminder to ${player.email}:`, err)
  }
}

export async function sendWeeklyWinnerEmail(
  winner: WeeklyWinner & { player: Player },
  allPlayers: Player[],
  company: Company
) {
  const resend = getResend()
  if (!resend) return

  const recipients = allPlayers.filter(p => p.email && p.is_active)
  if (recipients.length === 0) return

  const subject = `🏆 Weekly Champion: ${winner.player.name} wins this week at ${company.name}!`

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="background:#09090b;color:#f4f4f5;font-family:system-ui,sans-serif;padding:32px;margin:0">
      <div style="max-width:500px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="margin:0;font-size:28px">🏆 Weekly Champion!</h1>
          <p style="margin:8px 0 0;opacity:0.9">${company.name} · WorkQuest</p>
        </div>
        <div style="background:#13131f;border-radius:12px;padding:32px;border:1px solid #f59e0b;text-align:center">
          <div style="width:80px;height:80px;border-radius:50%;background:${winner.player.avatar_color};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;font-weight:bold;color:white">
            ${winner.player.name.charAt(0).toUpperCase()}
          </div>
          <h2 style="margin:0 0 8px;font-size:28px">${winner.player.name}</h2>
          <p style="color:#f59e0b;font-size:18px;margin:0 0 4px;font-weight:600">🥇 This Week's Champion</p>
          <p style="color:#7c3aed;font-size:32px;font-weight:800;margin:16px 0">${winner.total_score} pts</p>
          <p style="color:#a1a1aa;margin:0">Incredible work this week! 🔥</p>
        </div>
        <div style="text-align:center;margin-top:24px">
          <a href="${appUrl}/leaderboard" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
            View Full Leaderboard →
          </a>
        </div>
        <p style="text-align:center;color:#3f3f46;font-size:12px;margin-top:16px">WorkQuest · ${company.name}</p>
      </div>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from,
      to: recipients.map(p => p.email!),
      subject,
      html,
    })
  } catch (err) {
    console.error('Failed to send weekly winner email:', err)
  }
}
