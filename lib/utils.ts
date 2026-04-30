import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateScore(
  impactScore: number,
  effortScore: number,
  timeValueScore: number,
  kpiPriority: number,
  contributionType: 'direct' | 'indirect'
): number {
  const base = impactScore * 0.4 + effortScore * 0.3 + timeValueScore * 0.3
  const priorityMultiplier =
    kpiPriority === 1 ? 1.5 :
    kpiPriority === 2 ? 1.25 :
    kpiPriority === 3 ? 1.0 : 0.85
  const contributionMultiplier = contributionType === 'direct' ? 1.0 : 0.7
  return Math.round(base * priorityMultiplier * contributionMultiplier * 10)
}

export function formatScore(score: number): string {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
  return score.toString()
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 7) return '🔥🔥🔥'
  if (streak >= 5) return '🔥🔥'
  if (streak >= 3) return '🔥'
  return ''
}

export function getWeekRange(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d')
  } catch {
    return dateStr
  }
}

export function getProgressPercent(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function getKPIPriorityLabel(priority: number): string {
  if (priority === 1) return 'P1 — Critical'
  if (priority === 2) return 'P2 — High'
  if (priority === 3) return 'P3 — Medium'
  return `P${priority} — Low`
}

export function getKPIPriorityColor(priority: number): string {
  if (priority === 1) return 'text-red-400 bg-red-400/10 border-red-400/20'
  if (priority === 2) return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
  if (priority === 3) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
  return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

export function getDaysUntilDeadline(endDate: string | null): number | null {
  if (!endDate) return null
  const diff = new Date(endDate).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function generateAvatarColor(name: string): string {
  const colors = [
    '#7c3aed', '#0891b2', '#059669', '#d97706',
    '#dc2626', '#db2777', '#2563eb', '#65a30d',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
