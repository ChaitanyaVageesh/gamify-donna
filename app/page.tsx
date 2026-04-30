'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Zap, TrendingUp, ClipboardList, Users, Target, Star } from 'lucide-react'
import { formatScore, getRankEmoji, getStreakEmoji } from '@/lib/utils'
import ScoreGraph from '@/components/ScoreGraph'
import KPIProgress from '@/components/KPIProgress'
import type { Company, KPI, LeaderboardEntry, TaskLog } from '@/lib/types'

const COMPANY_STATE_LABELS: Record<string, string> = {
  idea: 'Idea Stage', mvp: 'MVP', early_stage: 'Early Stage',
  seed: 'Seed Funded', series_a: 'Series A', series_b: 'Series B+',
  pre_revenue: 'Pre-Revenue', paid_customers: 'Paid Customers',
  growth: 'Growth Stage', bootstrapped: 'Bootstrapped',
}

function StatCard({ icon: Icon, label, value, sub, color = '#7c3aed' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }} className="score-display">{value}</p>
        {sub && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentTasks, setRecentTasks] = useState<TaskLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const companyRes = await fetch('/api/company')
      const { company: c } = await companyRes.json()

      if (!c) {
        router.push('/setup')
        return
      }

      setCompany(c)

      const [kpisRes, lbRes, tasksRes] = await Promise.all([
        fetch(`/api/kpis?company_id=${c.id}`),
        fetch(`/api/leaderboard?company_id=${c.id}`),
        fetch(`/api/tasks?company_id=${c.id}&limit=10`),
      ])

      const [kpisData, lbData, tasksData] = await Promise.all([
        kpisRes.json(), lbRes.json(), tasksRes.json(),
      ])

      setKpis(kpisData.kpis ?? [])
      setLeaderboard(lbData.leaderboard ?? [])
      setRecentTasks(tasksData.tasks ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 rounded-full border-t-transparent mx-auto mb-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p>Loading WorkQuest...</p>
        </div>
      </div>
    )
  }

  if (!company) return null

  const totalTasksToday = recentTasks.filter(t => t.task_date === new Date().toISOString().split('T')[0]).length
  const totalPlayers = leaderboard.length
  const topPlayer = leaderboard[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Company Banner */}
      <div
        className="rounded-2xl p-6 mb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a3e 0%, #0a1929 50%, #0a1a1a 100%)', border: '1px solid var(--border-glow)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 60%), radial-gradient(circle at 80% 50%, #06b6d4 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black" style={{ background: 'linear-gradient(90deg, #a78bfa, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {company.name}
              </h1>
              <span className="badge" style={{ background: '#7c3aed20', color: '#a78bfa', borderColor: '#7c3aed40', fontSize: 11 }}>
                {COMPANY_STATE_LABELS[company.state] ?? company.state}
              </span>
            </div>
            <p style={{ color: 'var(--muted)', maxWidth: 500, fontSize: 14 }}>{company.description}</p>
          </div>
          <Link href="/log" className="btn btn-primary" style={{ fontSize: 15 }}>
            <Zap size={16} /> Log Today&apos;s Work
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Team Members" value={totalPlayers} color="#7c3aed" />
        <StatCard icon={Target} label="Active KPIs" value={kpis.length} color="#06b6d4" />
        <StatCard icon={ClipboardList} label="Today's Logs" value={totalTasksToday} color="#10b981" />
        <StatCard
          icon={Trophy}
          label="Current Leader"
          value={topPlayer?.player.name ?? '—'}
          sub={topPlayer ? `${formatScore(topPlayer.total_score)} pts total` : undefined}
          color="#f59e0b"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - KPIs + Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* KPIs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title" style={{ margin: 0 }}>Active KPIs</h2>
              <Link href="/kpis" className="text-xs font-medium" style={{ color: 'var(--primary-light)' }}>Manage →</Link>
            </div>
            {kpis.length === 0 ? (
              <div className="card text-center" style={{ color: 'var(--muted)', padding: '32px 20px' }}>
                <Target size={32} className="mx-auto mb-3 opacity-40" />
                <p>No KPIs set yet</p>
                <Link href="/kpis" className="btn btn-secondary mt-3" style={{ fontSize: 13 }}>Set KPIs</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {kpis.slice(0, 4).map(kpi => (
                  <KPIProgress key={kpi.id} kpi={kpi} compact />
                ))}
                {kpis.length > 4 && (
                  <Link href="/kpis" style={{ fontSize: 12, color: 'var(--muted)', display: 'block', textAlign: 'center' }}>
                    +{kpis.length - 4} more KPIs →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="section-title">Recent Activity</h2>
            {recentTasks.length === 0 ? (
              <div className="card text-center" style={{ color: 'var(--muted)', padding: '24px' }}>
                No tasks logged yet
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.slice(0, 8).map(task => (
                  <div key={task.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: (task.player as { avatar_color?: string })?.avatar_color ?? 'var(--primary)', color: 'white' }}
                    >
                      {(task.player as { name?: string })?.name?.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }} className="truncate">{task.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {(task.player as { name?: string })?.name} · {task.task_date}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0 }}>
                      +{task.total_score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Leaderboard */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title" style={{ margin: 0 }}>Leaderboard</h2>
            <Link href="/leaderboard" className="text-xs font-medium" style={{ color: 'var(--primary-light)' }}>Full view →</Link>
          </div>

          {leaderboard.length === 0 ? (
            <div className="card text-center" style={{ color: 'var(--muted)', padding: '48px' }}>
              <Trophy size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold mb-2">No scores yet</p>
              <p style={{ fontSize: 13 }}>Add players and start logging tasks!</p>
              <div className="flex gap-3 justify-center mt-4">
                <Link href="/setup" className="btn btn-secondary" style={{ fontSize: 13 }}>Add Players</Link>
                <Link href="/log" className="btn btn-primary" style={{ fontSize: 13 }}>Log Tasks</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map(entry => (
                <div
                  key={entry.player.id}
                  className="card animate-slide-up"
                  style={{
                    border: entry.rank === 1 ? '1px solid #f59e0b40' : '1px solid var(--border)',
                    background: entry.rank === 1 ? 'linear-gradient(135deg, #13131f, #1a1408)' : 'var(--card)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-10 text-center flex-shrink-0">
                      <span style={{ fontSize: entry.rank <= 3 ? 22 : 16, fontWeight: 800, color: entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#94a3b8' : entry.rank === 3 ? '#cd7f32' : 'var(--muted)' }}>
                        {getRankEmoji(entry.rank)}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                      style={{ background: entry.player.avatar_color, fontSize: 16 }}
                    >
                      {entry.player.name.charAt(0)}
                    </div>

                    {/* Name + streak */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold truncate">{entry.player.name}</p>
                        {entry.streak > 2 && (
                          <span style={{ fontSize: 12 }}>{getStreakEmoji(entry.streak)}</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {entry.task_count} tasks · {entry.streak}d streak
                      </p>
                    </div>

                    {/* Scores */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-xl score-display" style={{ color: entry.rank === 1 ? '#f59e0b' : 'var(--text)' }}>
                        {formatScore(entry.total_score)}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                        +{formatScore(entry.weekly_score)} this week
                      </p>
                    </div>

                    {/* Mini graph */}
                    <div className="w-24 hidden lg:block flex-shrink-0">
                      <ScoreGraph
                        data={entry.daily_scores.slice(-14)}
                        color={entry.player.avatar_color}
                        height={48}
                      />
                    </div>
                  </div>

                  {/* Score bar */}
                  {leaderboard[0] && leaderboard[0].total_score > 0 && (
                    <div className="progress-bar mt-3" style={{ height: 3 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(entry.total_score / leaderboard[0].total_score) * 100}%`,
                          background: entry.rank === 1 ? '#f59e0b' : entry.player.avatar_color,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TrendingUp summary */}
          {leaderboard.length > 0 && (
            <div className="card mt-4" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <TrendingUp size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Team Performance</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {leaderboard.reduce((s, e) => s + e.total_score, 0)} total points earned across {leaderboard.reduce((s, e) => s + e.task_count, 0)} tasks by {leaderboard.length} players
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                {[...Array(Math.min(5, leaderboard.length))].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: leaderboard[i].player.avatar_color, borderColor: 'var(--card)', marginLeft: i > 0 ? -8 : 0 }}
                  >
                    {leaderboard[i].player.name.charAt(0)}
                  </div>
                ))}
                {leaderboard.length > 5 && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>+{leaderboard.length - 5}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Winner Banner */}
      {topPlayer && topPlayer.weekly_score > 0 && (
        <div
          className="mt-8 rounded-xl p-4 flex items-center gap-4"
          style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}
        >
          <Star size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: 'var(--text)' }}>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{topPlayer.player.name}</span> is leading this week with{' '}
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{formatScore(topPlayer.weekly_score)} pts</span>
            {' '}— can you catch up? 🔥
          </p>
        </div>
      )}
    </div>
  )
}
