'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Send, CheckCircle, ChevronDown, Zap, Star, Clock } from 'lucide-react'
import type { Company, Player, KPI, TaskLog } from '@/lib/types'

interface TaskForm {
  title: string
  description: string
  kpi_id: string
  contribution_type: 'direct' | 'indirect'
  time_spent_hours: string
}

const emptyTask = (): TaskForm => ({
  title: '',
  description: '',
  kpi_id: '',
  contribution_type: 'direct',
  time_spent_hours: '1',
})

function ScoreCard({ task }: { task: TaskLog }) {
  const kpiTitle = (task.kpi as unknown as { title?: string } | null)?.title

  return (
    <div
      className="card animate-slide-up"
      style={{ border: '1px solid var(--border-glow)', background: 'linear-gradient(135deg, #13131f, #0d0d1a)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{task.title}</p>
          {kpiTitle && <p style={{ fontSize: 12, color: 'var(--muted)' }}>→ {kpiTitle} ({task.contribution_type})</p>}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-black text-2xl score-display" style={{ color: 'var(--primary-light)' }}>+{task.total_score}</p>
          <p style={{ fontSize: 11, color: 'var(--muted)' }}>points</p>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Impact', value: task.impact_score, color: '#7c3aed' },
          { label: 'Effort', value: task.effort_score, color: '#06b6d4' },
          { label: 'Time Value', value: task.time_value_score, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center rounded-lg p-2" style={{ background: 'var(--surface)' }}>
            <p style={{ fontSize: 20, fontWeight: 800, color }} className="score-display">{value}/10</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {task.llm_feedback && (
        <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text)' }}>{task.llm_feedback}</p>
        </div>
      )}

      {task.improvement_tip && (
        <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: '#7c3aed15', border: '1px solid #7c3aed30' }}>
          <Star size={13} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: 'var(--primary-light)' }}>{task.improvement_tip}</p>
        </div>
      )}
    </div>
  )
}

export default function LogPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0])
  const [tasks, setTasks] = useState<TaskForm[]>([emptyTask()])
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<TaskLog[]>([])
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const cRes = await fetch('/api/company')
      const { company: c } = await cRes.json()
      if (!c) return
      setCompany(c)
      const [pRes, kRes] = await Promise.all([
        fetch(`/api/players?company_id=${c.id}`),
        fetch(`/api/kpis?company_id=${c.id}`),
      ])
      const [pData, kData] = await Promise.all([pRes.json(), kRes.json()])
      setPlayers(pData.players ?? [])
      setKpis(kData.kpis ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function updateTask(index: number, field: keyof TaskForm, value: string) {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  function addTask() {
    setTasks(prev => [...prev, emptyTask()])
  }

  function removeTask(index: number) {
    setTasks(prev => prev.filter((_, i) => i !== index))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!company || !selectedPlayer) { setError('Select a player'); return }
    if (tasks.every(t => !t.title.trim())) { setError('Add at least one task'); return }

    setSubmitting(true)
    setError('')
    setResults([])

    const scored: TaskLog[] = []
    for (const task of tasks.filter(t => t.title.trim())) {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: selectedPlayer,
            company_id: company.id,
            kpi_id: task.kpi_id || null,
            task_date: taskDate,
            title: task.title,
            description: task.description || null,
            contribution_type: task.contribution_type,
            time_spent_hours: parseFloat(task.time_spent_hours) || 1,
          }),
        })
        const data = await res.json()
        if (data.task) scored.push(data.task)
      } catch { /* continue */ }
    }

    setResults(scored)
    setTasks([emptyTask()])
    setSubmitting(false)
  }

  const totalScored = results.reduce((s, t) => s + t.total_score, 0)
  const selectedPlayerData = players.find(p => p.id === selectedPlayer)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1">Log Tasks</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Record your work and earn points. You can log past days too.</p>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-8 animate-fade-in">
          <div
            className="rounded-xl p-4 mb-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #7c3aed20, #06b6d420)', border: '1px solid var(--border-glow)' }}
          >
            <Zap size={20} style={{ color: 'var(--primary-light)' }} />
            <div>
              <p className="font-bold">Nice work{selectedPlayerData ? `, ${selectedPlayerData.name}` : ''}!</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                {results.length} task{results.length > 1 ? 's' : ''} scored · <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>+{totalScored} total points</span>
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {results.map(task => <ScoreCard key={task.id} task={task} />)}
          </div>
          <button
            onClick={() => setResults([])}
            className="btn btn-secondary w-full mt-4"
          >
            Log More Tasks
          </button>
        </div>
      )}

      {results.length === 0 && (
        <form onSubmit={submit} className="space-y-6">
          {/* Player + Date selection */}
          <div className="card">
            <h3 className="font-bold mb-4">Who&apos;s logging?</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Player *</label>
                <select
                  className="input"
                  value={selectedPlayer}
                  onChange={e => setSelectedPlayer(e.target.value)}
                  required
                >
                  <option value="">Select player...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            {taskDate < new Date().toISOString().split('T')[0] && (
              <div className="mt-3 flex items-center gap-2 rounded-lg p-2" style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}>
                <Clock size={13} style={{ color: '#f59e0b' }} />
                <p style={{ fontSize: 12, color: '#f59e0b' }}>Logging for a past date — that&apos;s totally fine!</p>
              </div>
            )}
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Tasks ({tasks.length})</h3>
              <button type="button" onClick={addTask} className="btn btn-secondary" style={{ fontSize: 13, padding: '6px 12px' }}>
                <Plus size={13} /> Add Task
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={index} className="card-glow animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-light)' }}>Task {index + 1}</span>
                    {tasks.length > 1 && (
                      <button type="button" onClick={() => removeTask(index)} className="btn btn-danger" style={{ padding: '4px 8px' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="label">What did you do? *</label>
                      <input
                        className="input"
                        value={task.title}
                        onChange={e => updateTask(index, 'title', e.target.value)}
                        placeholder="e.g. Closed deal with XYZ client, Built auth system, Ran user interviews..."
                        required={index === 0}
                      />
                    </div>
                    <div>
                      <label className="label">More detail (optional but improves scoring)</label>
                      <textarea
                        className="input"
                        value={task.description}
                        onChange={e => updateTask(index, 'description', e.target.value)}
                        placeholder="Describe the task, its outcome, what was hard, or why it matters..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="label">KPI</label>
                        <select className="input" value={task.kpi_id} onChange={e => updateTask(index, 'kpi_id', e.target.value)}>
                          <option value="">General work</option>
                          {kpis.map(k => <option key={k.id} value={k.id}>{k.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Contribution</label>
                        <select className="input" value={task.contribution_type} onChange={e => updateTask(index, 'contribution_type', e.target.value as 'direct' | 'indirect')}>
                          <option value="direct">Direct</option>
                          <option value="indirect">Indirect</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Hours spent</label>
                        <input
                          className="input"
                          type="number"
                          min="0.25"
                          step="0.25"
                          max="24"
                          value={task.time_spent_hours}
                          onChange={e => updateTask(index, 'time_spent_hours', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg p-3 flex items-center gap-2" style={{ background: '#ef444415', border: '1px solid #ef444430' }}>
              <CheckCircle size={14} style={{ color: 'var(--danger)' }} />
              <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" style={{ fontSize: 15, padding: '14px' }} disabled={submitting}>
            <Send size={16} />
            {submitting ? `Scoring ${tasks.filter(t => t.title).length} task(s) with AI...` : 'Submit & Get Scores'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
            AI scores based on impact, effort, time value, and KPI priority.
          </p>
        </form>
      )}
    </div>
  )
}
