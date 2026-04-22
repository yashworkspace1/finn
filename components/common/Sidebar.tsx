'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronDown, LayoutDashboard, Brain, Eye, TrendingUp, MessageCircle,
  FileText, GitCompare, Calendar, Droplets, PieChart,
  Receipt, Gauge, Store, Target, BadgePercent, Shield,
  Upload, Trash2, LogOut
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const sidebarSections = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    color: '#a855f7',
    items: [
      { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard, color: '#a855f7' },
      { href: '/brain',      label: 'AI Brain',   icon: Brain,           color: '#c084fc' },
      { href: '/chat',       label: 'FINN Chat',  icon: MessageCircle,   color: '#f472b6' },
      { href: '/reports',    label: 'Reports',    icon: FileText,        color: '#fbbf24' },
    ]
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: Eye,
    color: '#60a5fa',
    items: [
      { href: '/spendlens',  label: 'SpendLens',        icon: Eye,        color: '#60a5fa' },
      { href: '/cashflow',   label: 'CashFlow',         icon: TrendingUp, color: '#34d399' },
      { href: '/compare',    label: 'Compare',          icon: GitCompare, color: '#a855f7' },
      { href: '/calendar',   label: 'Calendar',         icon: Calendar,   color: '#38bdf8' },
      { href: '/merchants',  label: 'Merchants',        icon: Store,      color: '#a78bfa' },
    ]
  },
  {
    id: 'protect',
    label: 'Protection',
    icon: Shield,
    color: '#34d399',
    items: [
      { href: '/leaks',  label: 'Money Leaks',  icon: Droplets,     color: '#f87171' },
      { href: '/budget', label: '50/30/20',     icon: PieChart,     color: '#fb923c' },
      { href: '/bills',  label: 'Bills & EMI',  icon: Receipt,      color: '#e879f9' },
      { href: '/runway', label: 'Runway',       icon: Gauge,        color: '#4ade80' },
    ]
  },
  {
    id: 'goals',
    label: 'Goals & Tax',
    icon: Target,
    color: '#fbbf24',
    items: [
      { href: '/goals', label: 'Goals',         icon: Target,       color: '#fbbf24' },
      { href: '/tax',   label: 'Tax Readiness', icon: BadgePercent, color: '#f97316' },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Auto-open the section containing the active route
  const getDefaultOpen = () => {
    const active: string[] = []
    sidebarSections.forEach(section => {
      const hasActive = section.items.some(
        item => pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
      )
      if (hasActive) active.push(section.id)
    })
    // Default open overview if nothing matches
    return active.length > 0 ? active : ['overview']
  }

  const [openSections, setOpenSections] = useState<string[]>(getDefaultOpen)

  useEffect(() => {
    setOpenSections(getDefaultOpen())
  }, [pathname])

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all your financial data? This cannot be undone.')) {
      try {
        const res = await fetch('/api/transactions', { method: 'DELETE' })
        if (res.ok) {
          window.location.reload()
        }
      } catch (e) {
        console.error('Failed to clear data', e)
      }
    }
  }

  return (
    <div style={{
      width: '220px',
      height: '100vh',
      background: 'var(--sidebar-bg, #080512)',
      borderRight: '1px solid rgba(168,85,247,0.08)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      zIndex: 40,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* ── LOGO ── */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: '1px solid rgba(168,85,247,0.08)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 900, color: 'white',
            boxShadow: '0 0 14px rgba(168,85,247,0.4)',
            flexShrink: 0
          }}>F</div>
          <div>
            <div style={{
              fontSize: '15px', fontWeight: 900,
              background: 'linear-gradient(135deg, #ddd6fe, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.3px'
            }}>FINN</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px' }}>
              Your Personal CFO
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTIONS ── */}
      <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {sidebarSections.map((section) => {
          const isOpen = openSections.includes(section.id)
          const hasActive = section.items.some(
            item => pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
          )

          return (
            <div key={section.id} style={{ marginBottom: '2px' }}>

              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  borderRadius: '0',
                }}
              >
                {/* Section color dot */}
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: hasActive ? section.color : 'rgba(255,255,255,0.2)',
                  boxShadow: hasActive ? `0 0 6px ${section.color}` : 'none',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }} />

                {/* Label */}
                <span style={{
                  flex: 1,
                  fontSize: '10px',
                  fontWeight: 700,
                  color: hasActive ? section.color : 'rgba(255,255,255,0.3)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  transition: 'color 0.2s'
                }}>
                  {section.label}
                </span>

                {/* Chevron */}
                <div style={{
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: 'rgba(255,255,255,0.2)'
                }}>
                  <ChevronDown size={12} />
                </div>
              </button>

              {/* Section Items */}
              <div style={{
                overflow: 'hidden',
                maxHeight: isOpen ? '400px' : '0px',
                transition: 'max-height 0.25s ease',
              }}>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px 8px 24px',
                          margin: '1px 8px 1px 0',
                          borderRadius: '0 10px 10px 0',
                          borderLeft: isActive
                            ? `2px solid ${item.color}`
                            : '2px solid transparent',
                          background: isActive
                            ? `${item.color}10`
                            : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {/* Icon box */}
                        <div style={{
                          width: '26px', height: '26px',
                          borderRadius: '7px',
                          background: isActive ? `${item.color}18` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isActive ? item.color + '30' : 'rgba(255,255,255,0.05)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 0.15s'
                        }}>
                          <Icon
                            size={12}
                            style={{
                              color: isActive ? item.color : 'rgba(255,255,255,0.3)',
                              transition: 'color 0.15s'
                            }}
                          />
                        </div>

                        {/* Label */}
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isActive ? 700 : 400,
                          color: isActive ? item.color : 'rgba(255,255,255,0.4)',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s'
                        }}>
                          {item.label}
                        </span>

                        {/* Active dot */}
                        {isActive && (
                          <div style={{
                            marginLeft: 'auto',
                            width: '5px', height: '5px',
                            borderRadius: '50%',
                            background: item.color,
                            boxShadow: `0 0 6px ${item.color}`,
                            flexShrink: 0
                          }} />
                        )}
                      </div>
                    </Link>
                  )
                })}

                {/* Section bottom spacer */}
                <div style={{ height: '6px' }} />
              </div>

            </div>
          )
        })}
      </div>

      {/* ── BOTTOM ACTIONS ── */}
      <div style={{
        padding: '8px',
        borderTop: '1px solid rgba(168,85,247,0.08)',
        flexShrink: 0
      }}>
        {/* Re-upload button */}
        <Link href="/onboarding" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '10px',
            background: 'rgba(168,85,247,0.08)',
            border: '1px solid rgba(168,85,247,0.15)',
            cursor: 'pointer', marginBottom: '6px',
            transition: 'all 0.2s'
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '7px',
              background: 'rgba(168,85,247,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Upload size={11} color="#a855f7" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(168,85,247,0.8)' }}>
              Re-upload Statement
            </span>
          </div>
        </Link>

        {/* Clear data button */}
        <button
          onClick={handleClearData}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '10px',
            background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.12)',
            cursor: 'pointer', marginBottom: '8px',
            transition: 'all 0.2s'
          }}
        >
          <div style={{
            width: '24px', height: '24px', borderRadius: '7px',
            background: 'rgba(248,113,113,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Trash2 size={11} color="#f87171" />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(248,113,113,0.7)' }}>
            Clear All Data
          </span>
        </button>

        {/* User card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: 'rgba(168,85,247,0.06)',
          border: '1px solid rgba(168,85,247,0.12)',
          position: 'relative'
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color: 'white', flexShrink: 0
          }}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{
              fontSize: '11px', fontWeight: 700,
              color: 'rgba(255,255,255,0.8)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {user?.email?.split('@')[0] || 'User'}
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
              {user?.email}
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: '4px'
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

    </div>
  )
}
