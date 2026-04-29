'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronLeft, ChevronRight, ChevronDown, 
  TrendingDown, Zap, Calendar as CalendarIcon,
  ArrowUpRight, Activity, Filter, Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatINR } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

function getHeatColor(spend: number, max: number): string {
  if (spend === 0) return 'transparent'
  const ratio = spend / max
  if (ratio < 0.25) return 'var(--accent-primary)20'
  if (ratio < 0.5)  return 'var(--accent-primary)40'
  if (ratio < 0.75) return 'var(--savings-color)60'
  return 'var(--expense-color)60'
}

const formatINRShort = (n: number) => {
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  useEffect(() => {
    setLoading(true)
    setSelectedDate(null)
    fetch(`/api/calendar?month=${monthStr}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [monthStr])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const maxSpend = data
    ? Math.max(...Object.values(data.byDate || {}).map((d: any) => d.totalSpend), 1)
    : 1

  const selectedDayData = selectedDate ? data?.byDate?.[selectedDate] : null

  return (
    <div className="flex flex-col gap-[20px]">
      
      {/* ── TOPBAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
          }}>
            <CalendarIcon size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Financial Calendar
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Visual heat-map of your daily spending activity
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <select 
              value={month} 
              onChange={e => setMonth(parseInt(e.target.value))}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
            >
              {MONTHS.map((m, i) => <option key={m} value={i + 1} style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>{m}</option>)}
            </select>
            <select 
              value={year} 
              onChange={e => setYear(parseInt(e.target.value))}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
            >
              {Array.from({ length: 10 }).map((_, i) => {
                const y = new Date().getFullYear() - 5 + i
                return <option key={y} value={y} style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>{y}</option>
              })}
            </select>
          </div>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* ── CALENDAR GRID ── */}
        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                {d}
              </div>
            ))}
            
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayData = data?.byDate?.[dateStr]
              const spend = dayData?.totalSpend || 0
              const isSelected = selectedDate === dateStr
              const isToday = dateStr === new Date().toISOString().slice(0, 10)

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  style={{
                    aspectRatio: '1', borderRadius: '12px',
                    background: isSelected ? 'var(--accent-primary)' : spend > 0 ? getHeatColor(spend, maxSpend) : 'var(--bg-elevated)',
                    border: isToday ? '2px solid var(--accent-primary)' : isSelected ? 'none' : '1px solid var(--border-subtle)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background 0.2s, border 0.2s', position: 'relative'
                  }}
                >
                  <span style={{ 
                    fontSize: '14px', fontWeight: 800, 
                    color: isSelected ? '#ffffff' : spend > 0 ? 'var(--text-primary)' : 'var(--text-muted)' 
                  }}>
                    {day}
                  </span>
                  {spend > 0 && (
                    <span style={{ 
                      fontSize: '9px', fontWeight: 600, 
                      color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' 
                    }}>
                      {formatINRShort(spend)}
                    </span>
                  )}
                  {dayData?.totalIncome > 0 && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--income-color)' }} />
                  )}
                </motion.button>
              )
            })}
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Intensity</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.1, 0.3, 0.6, 0.9].map((o, i) => (
                <div key={i} style={{ width: '12px', height: '12px', borderRadius: '3px', background: `var(--accent-primary)`, opacity: o }} />
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--income-color)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Income Received</span>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR STATS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="finn-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Monthly Context</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Month Outflow</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--expense-color)' }}>{formatINR(data?.totalSpend || 0)}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>DAILY AVG</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatINRShort(data?.avgDailySpend || 0)}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>CLEAN DAYS</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--income-color)' }}>{data?.zeroSpendDays || 0} Days</div>
                </div>
              </div>
            </div>
          </div>

          <div className="finn-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Spend by Day</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data?.dayOfWeekSpend && DAYS.map(day => {
                const val = data.dayOfWeekSpend[day] || 0
                const max = Math.max(...Object.values(data.dayOfWeekSpend as Record<string, number>), 1)
                const pct = (val / max) * 100
                return (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', width: '30px' }}>{day}</span>
                    <div style={{ flex: 1, height: '6px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: '999px' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', width: '40px', textAlign: 'right' }}>{formatINRShort(val)}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── SELECTED DAY DETAILS ── */}
      <AnimatePresence>
        {selectedDayData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="finn-card" 
            style={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={18} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {new Date(selectedDate!).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                    {selectedDayData.totalSpend > 0 && <span style={{ color: 'var(--expense-color)', fontWeight: 700 }}>Out: {formatINR(selectedDayData.totalSpend)}</span>}
                    {selectedDayData.totalIncome > 0 && <span style={{ color: 'var(--income-color)', fontWeight: 700 }}>In: {formatINR(selectedDayData.totalIncome)}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {selectedDayData.transactions.map((t: any, i: number) => (
                <div key={i} style={{ 
                  padding: '12px', background: 'var(--bg-elevated)', borderRadius: '12px', 
                  border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{t.merchant || t.description}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.category}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: t.type === 'credit' ? 'var(--income-color)' : 'var(--text-primary)' }}>
                    {t.type === 'credit' ? '+' : '-'}{formatINRShort(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-[400px] bg-muted rounded-2xl"/>
        <div className="space-y-4">
          <div className="h-40 bg-muted rounded-2xl"/>
          <div className="h-60 bg-muted rounded-2xl"/>
        </div>
      </div>
    </div>
  )
}
