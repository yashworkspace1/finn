'use client'

import { useEffect, useState } from 'react'
import { 
  Receipt, TrendingUp, AlertCircle, CheckCircle, 
  Plus, CreditCard, ArrowUpRight, Zap, Calendar,
  RefreshCw, ShieldAlert
} from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const formatINRShort = (n: number) => {
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

export default function BillsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    fetch('/api/bills')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const confirmBill = async (bill: any) => {
    setConfirming(bill.merchant)
    await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant: bill.merchant,
        label: bill.merchant,
        amount: bill.avgAmount,
        category: bill.category,
        is_emi: bill.isEMI,
      }),
    })
    setConfirming(null)
    fetchData()
  }

  if (loading) return <BillsSkeleton />

  const monthlyCommitment = data?.monthlyCommitment || 0

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
            <Receipt size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Bills & EMI Tracker
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Managing your mandatory monthly commitments
            </p>
          </div>
        </div>
      </div>

      {/* ── HERO COMMITMENT CARD ── */}
      <div className="finn-card" style={{ 
        padding: '30px', 
        background: 'linear-gradient(135deg, var(--health-bg), var(--bg-surface))',
        border: '1px solid var(--accent-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '20px',
            background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.2)'
          }}>
            <CreditCard size={32} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Total Monthly Commitment
            </div>
            <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {formatINR(monthlyCommitment)}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
              Tracking <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{data?.confirmed?.length || 0} active</span> bills and recurring patterns.
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--income-color)', marginBottom: '4px' }}>Next Bill: June 1st</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Housing Rent · {formatINR(22000)}</div>
          </div>
        </div>
      </div>

      {/* ── ALERTS ROW ── */}
      <AnimatePresence>
        {(data?.emisNearEnd?.length > 0 || data?.increasingBills?.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.emisNearEnd.map((emi: any, i: number) => (
              <motion.div 
                key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{ 
                  padding: '12px 20px', borderRadius: '12px', 
                  background: 'var(--income-bg)', border: '1px solid var(--income-color)',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}
              >
                <CheckCircle size={18} style={{ color: 'var(--income-color)' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {emi.label} EMI ends in {emi.emi_months_remaining} months — freeing up {formatINR(emi.amount)}/month! 🎉
                </p>
              </motion.div>
            ))}
            {data.increasingBills.map((b: any, i: number) => (
              <motion.div 
                key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{ 
                  padding: '12px 20px', borderRadius: '12px', 
                  background: 'var(--savings-bg)', border: '1px solid var(--savings-color)',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}
              >
                <TrendingUp size={18} style={{ color: 'var(--savings-color)' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {b.merchant} bill is increasing — up by {formatINR(b.variance)} vs last month.
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Confirmed Bills */}
        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--income-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={16} style={{ color: 'var(--income-color)' }} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Confirmed Bills</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.confirmed?.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No confirmed bills yet.</p>
            ) : (
              data.confirmed.map((bill: any, i: number) => (
                <div key={i} style={{ 
                  padding: '16px', background: 'var(--bg-elevated)', borderRadius: '16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{bill.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bill.is_emi ? 'Loan/EMI' : 'Recurring Bill'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>{formatINRShort(bill.amount)}</div>
                    {bill.emi_months_remaining && <div style={{ fontSize: '10px', color: 'var(--income-color)', fontWeight: 700 }}>{bill.emi_months_remaining} Left</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Auto-detected Patterns */}
        <div className="finn-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--savings-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} style={{ color: 'var(--savings-color)' }} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Detected Patterns</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.detected?.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No patterns detected yet. Upload more data!</p>
            ) : (
              data.detected.map((bill: any, i: number) => {
                const alreadyConfirmed = data.confirmed?.some((c: any) => c.merchant === bill.merchant)
                return (
                  <div key={i} style={{ 
                    padding: '16px', background: 'var(--bg-surface)', borderRadius: '16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {bill.merchant}
                        {bill.isEMI && <span style={{ fontSize: '9px', fontWeight: 800, background: 'var(--accent-soft)', color: 'var(--accent-text)', padding: '1px 5px', borderRadius: '4px' }}>EMI</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bill.monthCount} months · Avg {formatINRShort(bill.avgAmount)}</div>
                    </div>
                    <button
                      onClick={() => !alreadyConfirmed && confirmBill(bill)}
                      disabled={alreadyConfirmed || confirming === bill.merchant}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        background: alreadyConfirmed ? 'var(--income-bg)' : 'var(--bg-elevated)',
                        color: alreadyConfirmed ? 'var(--income-color)' : 'var(--text-secondary)',
                        fontSize: '11px', fontWeight: 800, border: 'none', cursor: alreadyConfirmed ? 'default' : 'pointer'
                      }}
                    >
                      {alreadyConfirmed ? 'Confirmed' : confirming === bill.merchant ? 'Saving...' : 'Confirm'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

function BillsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="h-40 bg-muted rounded-2xl"/>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-60 bg-muted rounded-2xl"/>
        <div className="h-60 bg-muted rounded-2xl"/>
      </div>
    </div>
  )
}
