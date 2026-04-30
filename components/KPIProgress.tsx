import { Target, Clock } from 'lucide-react'
import { getProgressPercent, getKPIPriorityLabel, getKPIPriorityColor, getDaysUntilDeadline } from '@/lib/utils'
import type { KPI } from '@/lib/types'

interface Props {
  kpi: KPI
  compact?: boolean
}

export default function KPIProgress({ kpi, compact = false }: Props) {
  const percent = getProgressPercent(kpi.current_value, kpi.target_value)
  const daysLeft = getDaysUntilDeadline(kpi.end_date)

  const barColor =
    percent >= 100 ? 'var(--success)' :
    percent >= 60 ? 'var(--accent)' :
    percent >= 30 ? 'var(--gold)' :
    'var(--primary)'

  return (
    <div className="card" style={{ padding: compact ? '14px' : '20px' }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Target size={16} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: 2 }} />
          <div className="min-w-0">
            <p className="font-semibold truncate" style={{ fontSize: compact ? 13 : 15 }}>{kpi.title}</p>
            {!compact && kpi.description && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{kpi.description}</p>
            )}
          </div>
        </div>
        <span className={`badge ${getKPIPriorityColor(kpi.priority)}`} style={{ fontSize: 10, flexShrink: 0 }}>
          {getKPIPriorityLabel(kpi.priority)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-2">
        <div
          className="progress-fill"
          style={{ width: `${percent}%`, background: barColor }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>
            {kpi.current_value}{kpi.unit}
          </span>
          {' / '}
          {kpi.target_value}{kpi.unit}
        </span>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: percent >= 100 ? 'var(--success)' : 'var(--text)',
            }}
          >
            {percent}%
          </span>
          {daysLeft !== null && (
            <span
              className="flex items-center gap-1"
              style={{ fontSize: 11, color: daysLeft <= 3 ? 'var(--danger)' : 'var(--muted)' }}
            >
              <Clock size={10} />
              {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
            </span>
          )}
        </div>
      </div>

      {!compact && (
        <div className="flex items-center gap-2 mt-2">
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {kpi.frequency} · Started {new Date(kpi.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  )
}
