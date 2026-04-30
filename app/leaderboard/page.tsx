'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trophy, Star, TrendingUp, Calendar, X } from 'lucide-react'
import { formatScore, getRankEmoji, getStreakEmoji, formatDate } from '@/lib/utils'
import ScoreGraph from '@/components/ScoreGraph'
import type { LeaderboardEntry, WeeklyWinner, Player } from '@/lib/types'

interface PastWinner extends WeeklyWinner {
  player: Player
}

function PlayerModal({ entry, onClose }: { entry: LeaderboardEntry; onClose: () => void }) {
  const bestDay = entry.daily_scores.reduce((best, d) => d.score > best.score ? d : best, { date: '', score: 0 })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="card-glow w-full max-w-lg animate-slide-up"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-xl"
              style={{ background: entry.player.avatar_color }}
            >
              {entry.player.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-black text-xl">{entry.player.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                {getRankEmoji(entry.rank)} {entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : entry.rank === 3 ? '3rd' : `${entry.rank}th`} place
                {entry.streak > 2 && <span> · {getStreakEmoji(entry.streak)} {entry.streak}d streak</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Score', value: formatScore(entry.total_score), color: 'var(--primary-light)' },
            { label: 'This Week', value: formatScore(entry.weekly_score), color: 'var(--accent)' },
            { label: 'Tasks Logged', value: entry.task_count, color: 'var(--success)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="font-black text-2xl score-display" style={{ color }}>{value}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Score Graph */}
        <div className="mb-4">
          <p className="label mb-3">Score History (last 30 days)</p>
          <ScoreGraph data={entry.daily_scores} color={entry.player.avatar_color} height={140} showAxis />
        </div>

        {/* Best day */}
        {bestDay.score > 0 && (
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}>
            <Star size={16} style={{ color: '#f59e0b' }} />
            <p style={{ fontSize: 13 }}>
              Best day: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{formatDate(bestDay.date)}</span> with {bestDay.score} pts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [pastWinners, setPastWinners] = useState<PastWinner[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'total' | 'weekly'>('total')
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)

  const loadData = useCallback(async () => {
    try {
      const cRes = await fetch('/api/company')
      const { company: c } = await cRes.json()
      if (!c) return
      const res = await fetch(`/api/leaderboard?company_id=${c.id}`)
      const data = await res.json()
      setLeaderboard(data.leaderboard ?? [])
      setPastWinners(data.past_winners ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const sorted = view === 'weekly'
    ? [...leaderboard].sort((a, b) => b.weekly_score - a.weekly_score).map((e, i) => ({ ...e, rank: i + 1 }))
    : leaderboard

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black mb-1">Leaderboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Compete, improve, dominate. Weekly winners announced every Sunday.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {(['total', 'weekly'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={view === v ? { background: 'var(--primary)', color: 'white' } : { color: 'var(--muted)' }}
            >
              {v === 'total' ? 'All Time' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map(i => {
            const entry = sorted[i]
            const podiumRank = i === 1 ? 1 : i === 0 ? 2 : 3
            const heights = [120, 160, 100]
            const height = heights[i]
            return (
              <button
                key={entry.player.id}
                onClick={() => setSelectedEntry(entry)}
                className="card flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105"
                style={{
                  border: podiumRank === 1 ? '1px solid #f59e0b50' : '1px solid var(--border)',
                  paddingTop: `${Math.max(24, 60 - height * 0.2)}px`,
                  background: podiumRank === 1 ? 'linear-gradient(180deg, #1a1408, #13131f)' : 'var(--card)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-black text-white text-2xl mb-3 border-2"
                  style={{
                    background: entry.player.avatar_color,
                    borderColor: podiumRank === 1 ? '#f59e0b' : podiumRank === 2 ? '#94a3b8' : '#cd7f32',
                  }}
                >
                  {entry.player.name.charAt(0)}
                </div>
                <p style={{ fontSize: podiumRank === 1 ? 22 : 18 }}>
                  {podiumRank === 1 ? '🥇' : podiumRank === 2 ? '🥈' : '🥉'}
                </p>
                <p className="font-bold mt-1" style={{ fontSize: 14 }}>{entry.player.name}</p>
                <p className="font-black score-display" style={{ color: podiumRank === 1 ? '#f59e0b' : 'var(--primary-light)', fontSize: 20 }}>
                  {formatScore(view === 'weekly' ? entry.weekly_score : entry.total_score)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>pts</p>
                {entry.streak > 2 && <p style={{ fontSize: 13, marginTop: 4 }}>{getStreakEmoji(entry.streak)}</p>}
              </button>
            )
          })}
        </div>
      )}

      {/* Full Table */}
      {sorted.length === 0 ? (
        <div className="card text-center" style={{ color: 'var(--muted)', padding: '64px 32px' }}>
          <Trophy size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>No scores yet</p>
          <p style={{ fontSize: 14 }}>Start logging tasks to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => (
            <button
              key={entry.player.id}
              onClick={() => setSelectedEntry(entry)}
              className="card w-full text-left transition-all cursor-pointer"
              style={{
                border: entry.rank === 1 ? '1px solid #f59e0b30' : '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 text-center flex-shrink-0">
                  <span style={{
                    fontSize: entry.rank <= 3 ? 20 : 15,
                    fontWeight: 800,
                    color: entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#94a3b8' : entry.rank === 3 ? '#cd7f32' : 'var(--muted)',
                  }}>
                    {getRankEmoji(entry.rank)}
                  </span>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ background: entry.player.avatar_color }}
                >
                  {entry.player.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{entry.player.name}</p>
                    {entry.streak > 2 && <span style={{ fontSize: 12 }}>{getStreakEmoji(entry.streak)}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {entry.task_count} tasks · {entry.streak}d streak
                  </p>
                </div>
                <div className="hidden sm:block w-32 flex-shrink-0">
                  <ScoreGraph data={entry.daily_scores.slice(-14)} color={entry.player.avatar_color} height={40} />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-xl score-display" style={{ color: entry.rank === 1 ? '#f59e0b' : 'var(--text)' }}>
                    {formatScore(view === 'weekly' ? entry.weekly_score : entry.total_score)}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {view === 'weekly' ? 'this week' : 'total'} pts
                  </p>
                </div>
              </div>

              {/* Relative score bar */}
              {sorted[0] && (sorted[0].total_score > 0 || sorted[0].weekly_score > 0) && (
                <div className="progress-bar mt-3" style={{ height: 3 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${((view === 'weekly' ? entry.weekly_score : entry.total_score) / (view === 'weekly' ? sorted[0].weekly_score : sorted[0].total_score)) * 100}%`,
                      background: entry.rank === 1 ? '#f59e0b' : entry.player.avatar_color,
                    }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Past Winners */}
      {pastWinners.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title flex items-center gap-2">
            <Calendar size={18} style={{ color: 'var(--gold)' }} />
            Hall of Champions
          </h2>
          <div className="space-y-2">
            {pastWinners.map(w => (
              <div key={w.id} className="card flex items-center gap-4" style={{ padding: '12px 16px' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: w.player.avatar_color, fontSize: 13 }}>
                  {w.player.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ fontSize: 14 }}>🏆 {w.player.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Week of {formatDate(w.week_start)} — {formatDate(w.week_end)}
                  </p>
                </div>
                <p className="font-black score-display" style={{ color: '#f59e0b', fontSize: 18 }}>{formatScore(w.total_score)} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team-wide trend */}
      {leaderboard.length > 0 && (
        <div className="card mt-8 flex items-center gap-4" style={{ border: '1px solid var(--border-glow)', padding: '16px 20px' }}>
          <TrendingUp size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Team Performance</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              {leaderboard.reduce((s, e) => s + e.total_score, 0)} total points ·{' '}
              {leaderboard.reduce((s, e) => s + e.task_count, 0)} tasks ·{' '}
              {leaderboard.length} players
            </p>
          </div>
        </div>
      )}

      {selectedEntry && <PlayerModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    </div>
  )
}
