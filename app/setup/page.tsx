'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Users, Building2, CheckCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'
import { COMPANY_STATES } from '@/lib/types'
import type { Company, Player } from '@/lib/types'

function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div
      className="fixed bottom-6 right-6 z-50 card animate-slide-up flex items-start gap-3"
      style={{ border: `1px solid ${type === 'success' ? '#10b98140' : '#ef444440'}`, padding: '12px 16px', maxWidth: 380 }}
    >
      {type === 'success'
        ? <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
        : <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
      }
      <p style={{ fontSize: 13 }}>{message}</p>
    </div>
  )
}

type DbStatus = 'checking' | 'ok' | 'error_env' | 'error_schema' | 'error_connect'

function DbStatusBanner({ status, hint }: { status: DbStatus; hint: string }) {
  if (status === 'checking') {
    return (
      <div className="card flex items-center gap-3 mb-6" style={{ padding: '12px 16px' }}>
        <Loader2 size={15} className="animate-spin" style={{ color: 'var(--muted)' }} />
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Checking database connection...</p>
      </div>
    )
  }
  if (status === 'ok') {
    return (
      <div className="flex items-center gap-2 mb-6 rounded-lg px-3 py-2" style={{ background: '#10b98115', border: '1px solid #10b98130' }}>
        <CheckCircle size={14} style={{ color: 'var(--success)' }} />
        <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>Database connected</p>
      </div>
    )
  }
  const steps = status === 'error_env' ? [
    'Go to your Vercel project → Settings → Environment Variables',
    'Add NEXT_PUBLIC_SUPABASE_URL (e.g. https://xxxx.supabase.co)',
    'Add NEXT_PUBLIC_SUPABASE_ANON_KEY (anon/public key)',
    'Add SUPABASE_SERVICE_KEY (service_role key)',
    'Go to Deployments → click ⋯ → Redeploy',
  ] : status === 'error_schema' ? [
    'Open your Supabase project at app.supabase.com',
    'Go to SQL Editor → New Query',
    'Paste the entire contents of supabase/schema.sql',
    'Click Run — all tables will be created',
    'Reload this page',
  ] : [
    'Verify NEXT_PUBLIC_SUPABASE_URL is a valid https://xxxx.supabase.co URL',
    'Make sure your Supabase project is not paused (free tier pauses after 1 week of inactivity)',
    hint,
  ]

  return (
    <div className="card mb-6 animate-slide-up" style={{ border: '1px solid #ef444440', background: '#ef444408' }}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>
          {status === 'error_env' ? 'Environment variables not configured' :
           status === 'error_schema' ? 'Database tables not found — schema needs to be run' :
           'Cannot reach database'}
        </p>
      </div>
      <ol className="space-y-1" style={{ paddingLeft: 18 }}>
        {steps.map((s, i) => (
          <li key={i} style={{ fontSize: 13, color: 'var(--muted)', listStyleType: 'decimal' }}>{s}</li>
        ))}
      </ol>
      {status === 'error_schema' && (
        <a
          href="https://app.supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary mt-3"
          style={{ fontSize: 12, padding: '6px 12px', display: 'inline-flex' }}
        >
          <ExternalLink size={12} /> Open Supabase →
        </a>
      )}
    </div>
  )
}

export default function SetupPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'company' | 'players'>('company')
  const [company, setCompany] = useState<Company | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking')
  const [dbHint, setDbHint] = useState('')

  const [companyForm, setCompanyForm] = useState({ name: '', description: '', state: 'early_stage' })
  const [newPlayer, setNewPlayer] = useState({ name: '', email: '' })
  const [addingPlayer, setAddingPlayer] = useState(false)

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type })
  }

  useEffect(() => {
    async function load() {
      // Health check first
      try {
        const hRes = await fetch('/api/health')
        const hData = await hRes.json()
        if (hData.status === 'ok') {
          setDbStatus('ok')
        } else {
          setDbHint(hData.hint || hData.message || '')
          if (hData.step === 'env') setDbStatus('error_env')
          else if (hData.step === 'schema') setDbStatus('error_schema')
          else setDbStatus('error_connect')
          setLoading(false)
          return
        }
      } catch {
        setDbStatus('error_connect')
        setDbHint('Server unreachable')
        setLoading(false)
        return
      }

      // Load existing data
      try {
        const cRes = await fetch('/api/company')
        const { company: c } = await cRes.json()
        if (c) {
          setCompany(c)
          setCompanyForm({ name: c.name, description: c.description ?? '', state: c.state })
          const pRes = await fetch(`/api/players?company_id=${c.id}`)
          const { players: p } = await pRes.json()
          setPlayers(p ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function saveCompany(e: React.FormEvent) {
    e.preventDefault()
    if (dbStatus !== 'ok') {
      showToast('Fix the database connection first (see instructions above)', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCompany(data.company)
      showToast('Company saved!')
      setActiveTab('players')
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault()
    if (!company) { showToast('Save company info first', 'error'); return }
    setAddingPlayer(true)
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: company.id, ...newPlayer }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlayers(prev => [...prev, data.player])
      setNewPlayer({ name: '', email: '' })
      showToast(`${data.player.name} added!`)
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setAddingPlayer(false)
    }
  }

  async function removePlayer(playerId: string) {
    try {
      const res = await fetch('/api/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerId, is_active: false }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlayers(prev => prev.filter(p => p.id !== playerId))
      showToast('Player removed')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p style={{ fontSize: 13 }}>Connecting to database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black mb-1">Setup</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Configure your company and team members. All data is saved permanently to Supabase.</p>
      </div>

      <DbStatusBanner status={dbStatus} hint={dbHint} />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {([
          { key: 'company', label: 'Company Info', icon: Building2 },
          { key: 'players', label: 'Team Members', icon: Users },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === tab.key
              ? { background: 'var(--primary)', color: 'white' }
              : { color: 'var(--muted)' }
            }
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Company Tab */}
      {activeTab === 'company' && (
        <form onSubmit={saveCompany} className="space-y-5 animate-slide-up">
          <div>
            <label className="label">Company Name *</label>
            <input
              className="input"
              value={companyForm.name}
              onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Acme Inc."
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              value={companyForm.description}
              onChange={e => setCompanyForm(p => ({ ...p, description: e.target.value }))}
              placeholder="We build X for Y to achieve Z. Include your target market, core product, and current traction."
              rows={4}
            />
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              Detailed descriptions help the AI score tasks more accurately.
            </p>
          </div>
          <div>
            <label className="label">Company Stage</label>
            <select
              className="input"
              value={companyForm.state}
              onChange={e => setCompanyForm(p => ({ ...p, state: e.target.value }))}
            >
              {COMPANY_STATES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={saving || dbStatus !== 'ok'}
            >
              <Save size={15} />
              {saving ? 'Saving...' : company ? 'Update Company' : 'Save & Continue'}
            </button>
            {company && (
              <button type="button" onClick={() => router.push('/')} className="btn btn-secondary">
                Dashboard
              </button>
            )}
          </div>
        </form>
      )}

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="animate-slide-up">
          {!company ? (
            <div className="card text-center" style={{ color: 'var(--muted)', padding: '32px', marginBottom: 20 }}>
              <p>Save company info first</p>
              <button onClick={() => setActiveTab('company')} className="btn btn-primary mt-3" style={{ fontSize: 13 }}>
                Go to Company Tab
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={addPlayer} className="card mb-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Plus size={16} style={{ color: 'var(--primary-light)' }} />
                  Add Team Member
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="label">Name *</label>
                    <input className="input" value={newPlayer.name} onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" required />
                  </div>
                  <div>
                    <label className="label">Email (for reminders)</label>
                    <input className="input" type="email" value={newPlayer.email} onChange={e => setNewPlayer(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={addingPlayer || dbStatus !== 'ok'}>
                  <Plus size={15} />
                  {addingPlayer ? 'Adding...' : 'Add Player'}
                </button>
              </form>

              <div>
                <h3 className="section-title">Team ({players.length})</h3>
                {players.length === 0 ? (
                  <div className="card text-center" style={{ color: 'var(--muted)', padding: '32px' }}>
                    <Users size={32} className="mx-auto mb-3 opacity-40" />
                    <p>No team members yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {players.map(player => (
                      <div key={player.id} className="card flex items-center gap-3" style={{ padding: '12px 16px' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: player.avatar_color }}>
                          {player.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold" style={{ fontSize: 14 }}>{player.name}</p>
                          {player.email
                            ? <p style={{ fontSize: 12, color: 'var(--muted)' }}>{player.email}</p>
                            : <p style={{ fontSize: 12, color: 'var(--gold)' }}>No email — won&apos;t receive reminders</p>
                          }
                        </div>
                        <button onClick={() => removePlayer(player.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {players.length > 0 && (
                <div className="flex gap-3 mt-6">
                  <button onClick={() => router.push('/kpis')} className="btn btn-primary flex-1">Set Up KPIs →</button>
                  <button onClick={() => router.push('/')} className="btn btn-secondary">Dashboard</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
