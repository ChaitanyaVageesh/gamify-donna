'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, ClipboardList, Trophy, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log', label: 'Log Tasks', icon: ClipboardList },
  { href: '/kpis', label: 'KPIs', icon: Target },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/setup', label: 'Setup', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'rgba(7, 7, 15, 0.9)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <span
            className="hidden sm:block"
            style={{ background: 'linear-gradient(90deg, #a78bfa, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            WorkQuest
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'text-white'
                    : 'hover:text-white'
                )}
                style={active
                  ? { background: 'var(--primary)', color: 'white' }
                  : { color: 'var(--muted)' }
                }
              >
                <Icon size={15} />
                <span className="hidden md:block">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
