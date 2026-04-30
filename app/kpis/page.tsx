'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Sparkles, ChevronUp, ChevronDown, Edit2, Save, X, CheckCircle, Target, Lightbulb } from 'lucide-react'
import { KPI_FREQUENCIES, COMPANY_STATES } from '@/lib/types'
import type { Company, KPI } from '@/lib/types'
import KPIProgress from '@/components/KPIProgress'

function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 card animate-slide-up flex items-center gap-3" style={{ border: `1px solid ${type === 'success' ? '#10b98140' : '#ef444440'}`, padding: '12px 16px', maxWidth: 320 }}>
      <CheckCircle size={16} style={{ color: type === 'success' ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />
      <p style={{ fontSize: 13 }}>{message}</p>
    </div>
  )
}

const defaultForm = {
  title: '', description: '', target_value: '', unit: '%',
  priority: '1', frequency: 'weekly', start_date: new Date().toISOString().split('T')[0], end_date: '',
}

export default function KPIsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<{ analysis: Array<{kpi: string; evaluation: string; comment: string}>; suggestions: Array<{title: string; description: string; why: string}> } | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [editCurrentValue, setEditCurrentValue] = useState<{ id: string; value: string } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error' = 'success') { setToast({ message, type }) }

  const loadData = useCallback(async () => {
    try {
      const cRes = await fetch('/api/company')
      const { company: c } = await cRes.json()
      if (!c) return
      setCompany(c)
      const kRes = await fetch(`/api/kpis?company_id=${c.id}`)
      const { kpis: k } = await kRes.json()
      setKpis(k ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function saveKPI(e: React.FormEvent) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    try {
      const res = await fetch('/api/kpis', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : { company_id: company.id }),
          title: form.title,
          description: form.description || null,
          target_value: parseFloat(form.target_value) || 100,
          unit: form.unit,
          priority: parseInt(form.priority) || 1,
          frequency: form.frequency,
          start_date: form.start_date,
          end_date: form.end_date || null,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      if (editingId) {
        setKpis(prev => prev.map(k => k.id === editingId ? data.kpi : k).sort((a, b) => a.priority - b.priority))
      } else {
        setKpis(prev => [...prev, data.kpi].sort((a, b) => a.priority - b.priority))
      }
      setForm(defaultForm)
      setShowForm(false)
      setEditingId(null)
      showToast(editingId ? 'KPI updated!' : 'KPI created!')
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteKPI(id: string) {
    try {
      const res = await fetch(`/api/kpis?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setKpis(prev => prev.filter(k => k.id !== id))
      showToast('KPI removed')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  async function updateCurrentValue(id: string, value: number) {
    try {
      const res = await fetch('/api/kpis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, current_value: value }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setKpis(prev => prev.map(k => k.id === id ? data.kpi : k))
      setEditCurrentValue(null)
      showToast('Progress updated!')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  async function getSuggestions() {
    if (!company) return
    setLoadingSuggestions(true)
    try {
      const res = await fetch(`/api/kpis?company_id=${company.id}&suggest=true`)
      const data = await res.json()
      console.log('Suggestions response:', data)
      
      if (!res.ok) {
        console.error('API error:', data.error)
        showToast(`Failed to get suggestions: ${data.error}`, 'error')
        return
      }
      
      if (!data.suggestions) {
        console.warn('No suggestions in response')
        showToast('No suggestions available', 'error')
        return
      }
      
      setSuggestions(data.suggestions)
    } catch (err) {
      console.error('Suggestions fetch error:', err)
      showToast('Failed to get suggestions', 'error')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  function startEdit(kpi: KPI) {
    setForm({
      title: kpi.title,
      description: kpi.description ?? '',
      target_value: String(kpi.target_value),
      unit: kpi.unit,
      priority: String(kpi.priority),
      frequency: kpi.frequency,
      start_date: kpi.start_date,
      end_date: kpi.end_date ?? '',
    })
    setEditingId(kpi.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function useSuggestion(s: { title: string; description: string }) {
    setForm(prev => ({ ...prev, title: s.title, description: s.description }))
    setShowForm(true)
    setSuggestions(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black mb-1">KPI Management</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Set and track your team&apos;s key performance indicators</p>
        </div>
        <div className="flex gap-2">
          <button onClick={getSuggestions} className="btn btn-secondary" disabled={loadingSuggestions}>
            <Sparkles size={15} />
            {loadingSuggestions ? 'Thinking...' : 'AI Suggest'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(defaultForm) }} className="btn btn-primary">
            <Plus size={15} />
            Add KPI
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions && (
        <div className="card-glow mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Sparkles size={16} style={{ color: '#f59e0b' }} />
              AI KPI Suggestions
            </h3>
            <button onClick={() => setSuggestions(null)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
              <X size={14} />
            </button>
          </div>

          {suggestions.analysis && suggestions.analysis.length > 0 && (
            <div className="mb-4">
              <p className="label">Analysis of Current KPIs</p>
              <div className="space-y-2">
                {suggestions.analysis.map((a, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start gap-2">
                      <span className="badge" style={{
                        color: a.evaluation === 'appropriate' ? 'var(--success)' : a.evaluation === 'too_ambitious' ? 'var(--danger)' : 'var(--gold)',
                        borderColor: a.evaluation === 'appropriate' ? '#10b98130' : a.evaluation === 'too_ambitious' ? '#ef444430' : '#f59e0b30',
                        background: a.evaluation === 'appropriate' ? '#10b98110' : a.evaluation === 'too_ambitious' ? '#ef444410' : '#f59e0b10',
                        fontSize: 10, flexShrink: 0,
                      }}>
                        {a.evaluation.replace('_', ' ')}
                      </span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{a.kpi}</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{a.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="label">Suggested KPIs</p>
          <div className="space-y-2">
            {suggestions.suggestions.map((s, i) => (
              <div key={i} className="rounded-lg p-3 flex items-start gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Lightbulb size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{s.description}</p>
                  <p style={{ fontSize: 11, color: '#a78bfa', marginTop: 4 }}>Why: {s.why}</p>
                </div>
                <button onClick={() => useSuggestion(s)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12, flexShrink: 0 }}>
                  Use this
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit KPI Form */}
      {showForm && (
        <form onSubmit={saveKPI} className="card-glow mb-6 animate-slide-up">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Target size={16} style={{ color: 'var(--primary-light)' }} />
            {editingId ? 'Edit KPI' : 'New KPI'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">KPI Title *</label>
                <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Monthly Recurring Revenue (MRR)" required />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What this KPI measures and why it matters" />
              </div>
              <div>
                <label className="label">Target Value *</label>
                <input className="input" type="number" value={form.target_value} onChange={e => setForm(p => ({ ...p, target_value: e.target.value }))} placeholder="10000" required />
              </div>
              <div>
                <label className="label">Unit</label>
                <input className="input" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="$, users, %, leads..." />
              </div>
              <div>
                <label className="label">Priority (1 = highest)</label>
                <input className="input" type="number" min="1" max="10" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} />
              </div>
              <div>
                <label className="label">Frequency</label>
                <select className="input" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                  {KPI_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input className="input" type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Deadline (optional)</label>
                <input className="input" type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                <Save size={15} />
                {saving ? 'Saving...' : editingId ? 'Update KPI' : 'Create KPI'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* KPIs List */}
      {kpis.length === 0 ? (
        <div className="card text-center" style={{ color: 'var(--muted)', padding: '64px 32px' }}>
          <Target size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No KPIs set yet</p>
          <p style={{ fontSize: 14 }}>Define what success looks like for your team</p>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={getSuggestions} className="btn btn-secondary">
              <Sparkles size={14} /> Get AI Suggestions
            </button>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus size={14} /> Add First KPI
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {kpis.map((kpi, index) => (
            <div key={kpi.id} className="animate-fade-in">
              <KPIProgress kpi={kpi} />
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-2">
                  {/* Priority arrows */}
                  <button
                    onClick={async () => {
                      if (kpi.priority <= 1) return
                      const res = await fetch('/api/kpis', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: kpi.id, priority: kpi.priority - 1 }) })
                      const data = await res.json()
                      if (!data.error) setKpis(prev => prev.map(k => k.id === kpi.id ? data.kpi : k).sort((a, b) => a.priority - b.priority))
                    }}
                    disabled={kpi.priority <= 1}
                    style={{ color: 'var(--muted)', opacity: kpi.priority <= 1 ? 0.3 : 1, padding: '4px 8px' }}
                    className="btn btn-secondary"
                    title="Increase priority"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={async () => {
                      if (index >= kpis.length - 1) return
                      const res = await fetch('/api/kpis', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: kpi.id, priority: kpi.priority + 1 }) })
                      const data = await res.json()
                      if (!data.error) setKpis(prev => prev.map(k => k.id === kpi.id ? data.kpi : k).sort((a, b) => a.priority - b.priority))
                    }}
                    disabled={index >= kpis.length - 1}
                    style={{ color: 'var(--muted)', opacity: index >= kpis.length - 1 ? 0.3 : 1, padding: '4px 8px' }}
                    className="btn btn-secondary"
                    title="Decrease priority"
                  >
                    <ChevronDown size={13} />
                  </button>
                  {/* Update current value */}
                  {editCurrentValue?.id === kpi.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="input"
                        style={{ width: 100, padding: '4px 8px', fontSize: 13 }}
                        type="number"
                        value={editCurrentValue.value}
                        onChange={e => setEditCurrentValue({ id: kpi.id, value: e.target.value })}
                      />
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => updateCurrentValue(kpi.id, parseFloat(editCurrentValue.value) || 0)}>
                        <Save size={12} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setEditCurrentValue(null)}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setEditCurrentValue({ id: kpi.id, value: String(kpi.current_value) })}>
                      Update progress
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(kpi)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => deleteKPI(kpi.id)} className="btn btn-danger" style={{ padding: '4px 8px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
