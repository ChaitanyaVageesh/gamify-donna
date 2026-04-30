'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatDateShort } from '@/lib/utils'

interface DailyScore {
  date: string
  score: number
}

interface Props {
  data: DailyScore[]
  color?: string
  height?: number
  showAxis?: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="card"
        style={{ padding: '8px 12px', fontSize: '13px', border: '1px solid var(--border-glow)' }}
      >
        <p style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{payload[0].value} pts</p>
      </div>
    )
  }
  return null
}

export default function ScoreGraph({ data, color = '#7c3aed', height = 120, showAxis = false }: Props) {
  const formatted = data.map(d => ({ ...d, label: formatDateShort(d.date) }))

  if (data.every(d => d.score === 0)) {
    return (
      <div
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}
      >
        No scores logged yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formatted} margin={{ top: 5, right: 5, bottom: 0, left: showAxis ? 30 : -30 }}>
        {showAxis && (
          <>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: 'var(--bg)', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
