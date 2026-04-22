'use client'

import { useEffect, useState } from 'react'
import { 
  FileText, CheckCircle, AlertCircle, Info, 
  TrendingUp, ShieldCheck, Zap, ArrowUpRight,
  Target, Activity
} from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

const formatINRShort = (n: number) => {
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

export default function TaxPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tax')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TaxSkeleton />

  const score = data?.score || 0
  const scoreColor = score >= 70 ? 'var(--income-color)' : score >= 40 ? 'var(--savings-color)' : 'var(--expense-color)'

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
            <ShieldCheck size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Tax Readiness
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Automated scan for potential tax deductions
            </p>
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="finn-card" style={{ 
        padding: '12px 20px', background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Info size={16} style={{ color: 'var(--accent-primary)' }} />
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Important:</span> This is not official tax advice. Estimates are based on identifiable transaction patterns. Consult a professional.
        </p>
      </div>

      {/* ── SCORE HERO CARD ── */}
      <div className="finn-card" style={{ 
        padding: '30px', 
        background: `linear-gradient(135deg, ${scoreColor}10, var(--bg-surface))`,
        border: `1px solid ${scoreColor}40`
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '30px', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="44" fill="none"
                stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray="276.4"
                initial={{ strokeDashoffset: 276.4 }}
                animate={{ strokeDashoffset: 276.4 - (276.4 * score) / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>/100</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Current Readiness Level
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {score >= 70 ? 'Excellent Coverage' : score >= 40 ? 'Partial Readiness' : 'Minimal Detection'}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {score >= 70 ? 'Most common deductions identified.' : 'More transaction data needed for better detection.'}
            </p>
          </div>

          <div className="finn-card" style={{ padding: '16px', background: 'var(--income-bg)', border: '1px solid var(--income-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--income-color)', textTransform: 'uppercase', marginBottom: '2px' }}>Est. Tax Saving</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{formatINRShort(data?.estimatedTaxSaving || 0)}</div>
          </div>
        </div>
      </div>

      {/* ── CHECKLIST ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Deduction Checklist</h3>
          {data?.checks?.map((check: any, i: number) => (
            <div key={i} className="finn-card" style={{ 
              padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px',
              borderLeft: `4px solid ${check.condition ? 'var(--income-color)' : 'var(--border-subtle)'}`,
              background: check.condition ? 'var(--bg-surface)' : 'var(--bg-elevated)40'
            }}>
              <div style={{ marginTop: '2px' }}>
                {check.condition ? <CheckCircle size={18} color="var(--income-color)" /> : <AlertCircle size={18} color="var(--text-muted)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: check.condition ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {check.rule.label}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: check.condition ? 'var(--income-color)' : 'var(--text-muted)' }}>
                    {check.condition ? `+${check.weight} pts` : 'Incomplete'}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{check.rule.description}</p>
                {check.condition && check.data.totalAmount > 0 && (
                  <div style={{ marginTop: '8px', display: 'inline-block', padding: '2px 8px', borderRadius: '6px', background: 'var(--income-bg)', fontSize: '11px', fontWeight: 700, color: 'var(--income-color)' }}>
                    Found: {formatINR(check.data.totalAmount)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="finn-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Additional Scans</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {data?.tdsDetected ? <Zap size={14} color="var(--accent-primary)" /> : <Activity size={14} color="var(--text-muted)" />}
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>TDS & Salary</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data?.tdsDetected ? 'Salary credits and TDS deductions detected.' : 'No salary credit patterns identified yet.'}</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {data?.professionalExpenses > 0 ? <Zap size={14} color="var(--savings-color)" /> : <Activity size={14} color="var(--text-muted)" />}
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Professional Spends</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data?.professionalExpenses > 0 ? `${data.professionalExpenses} potential business expense items found.` : 'No professional-category spends detected.'}</p>
              </div>
            </div>
          </div>

          <div className="finn-card" style={{ padding: '24px', background: 'var(--bg-overlay)', border: '1px solid var(--accent-primary)', textAlign: 'center' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Ready to File?</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Generate a consolidated tax-ready report for your CA.</p>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: 'var(--accent-primary)', color: '#ffffff',
              fontWeight: 700, border: 'none', cursor: 'pointer'
            }}>
              Export Tax Report
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}

function TaxSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="h-32 bg-muted rounded-2xl"/>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-xl"/>)}
        </div>
        <div className="h-64 bg-muted rounded-2xl"/>
      </div>
    </div>
  )
}
