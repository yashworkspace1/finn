'use client'

import { useEffect, useState } from 'react'
import { 
  Target, Plus, Trash2, CheckCircle, 
  TrendingUp, Clock, Sparkles, ArrowUpRight,
  Zap, Calendar, ShieldCheck, X
} from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const GOAL_CATEGORIES = [
  'general', 'travel', 'emergency', 'education',
  'home', 'vehicle', 'gadget', 'wedding', 'retirement'
]

const CATEGORY_EMOJI: Record<string, string> = {
  general: '🎯', travel: '✈️', emergency: '🛡️',
  education: '📚', home: '🏠', vehicle: '🚗',
  gadget: '💻', wedding: '💍', retirement: '🌴'
}

const formatINRShort = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

export default function GoalsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', target_amount: '', target_date: '', category: 'general'
  })
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    fetch('/api/goals')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const createGoal = async () => {
    if (!form.title || !form.target_amount) return
    setSaving(true)
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ title: '', target_amount: '', target_date: '', category: 'general' })
    fetchData()
  }

  const addSavings = async (goal: any, amount: number) => {
    setUpdatingId(goal.id)
    const newSaved = Math.min(Number(goal.saved_amount) + amount, Number(goal.target_amount))
    await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: goal.id,
        saved_amount: newSaved,
        is_completed: newSaved >= Number(goal.target_amount),
      }),
    })
    setUpdatingId(null)
    fetchData()
  }

  const deleteGoal = async (id: string) => {
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  if (loading) return <GoalsSkeleton />

  const activeGoals = (data?.goals || []).filter((g: any) => !g.is_completed)
  const completedGoals = (data?.goals || []).filter((g: any) => g.is_completed)

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
            <Target size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>
              Goal Tracker
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Precision planning for your future milestones
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 24px', borderRadius: '12px',
            background: 'var(--accent-primary)', color: '#ffffff',
            fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* ── SAVINGS INSIGHT ── */}
      {data?.avgMonthlySavings > 0 && (
        <div className="finn-card" style={{ 
          padding: '12px 20px', background: 'var(--income-bg)', border: '1px solid var(--income-color)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <TrendingUp size={18} style={{ color: 'var(--income-color)' }} />
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Your monthly savings average is <span style={{ fontWeight: 900 }}>{formatINR(data.avgMonthlySavings)}</span>. Goal projections are based on this velocity.
          </p>
        </div>
      )}

      {/* ── CREATE FORM ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="finn-card" style={{ padding: '24px', position: 'relative' }}
          >
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>Create New Milestone</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Title</label>
                <input 
                  type="text" placeholder="Goa Trip, MacBook..." value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target (₹)</label>
                <input 
                  type="number" placeholder="50000" value={form.target_amount} 
                  onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Category</label>
                <select 
                  value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                >
                  {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Date</label>
                <input 
                  type="date" value={form.target_date} 
                  onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={createGoal} disabled={saving} style={{ padding: '10px 30px', borderRadius: '10px', background: 'var(--accent-primary)', color: '#ffffff', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                {saving ? 'Creating...' : 'Create Milestone'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVE GOALS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {activeGoals.map((goal: any, i: number) => (
          <div key={i} className="finn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {CATEGORY_EMOJI[goal.category] || '🎯'}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{goal.title}</h4>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{formatINR(goal.target_amount)} Target</div>
                </div>
              </div>
              <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800 }}>
                <span style={{ color: 'var(--accent-primary)' }}>{goal.progressPct.toFixed(1)}% Saved</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatINRShort(goal.saved_amount)} / {formatINRShort(goal.target_amount)}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progressPct}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), #7c3aed)', borderRadius: '999px' }} />
              </div>
            </div>

            {goal.monthsToComplete !== null && (
              <div style={{ padding: '12px', background: goal.onTrack ? 'var(--income-bg)' : 'var(--expense-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} style={{ color: goal.onTrack ? 'var(--income-color)' : 'var(--expense-color)' }} />
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Est. completion in <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{goal.monthsToComplete.toFixed(1)} months</span>. 
                  {goal.target_date && (goal.onTrack ? ' On track.' : ' Behind schedule.')}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>Quick Save:</span>
              {[2000, 5000, 10000].map(amt => (
                <button
                  key={amt} onClick={() => addSavings(goal, amt)} disabled={updatingId === goal.id}
                  style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  +{formatINRShort(amt)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── COMPLETED GOALS ── */}
      {completedGoals.length > 0 && (
        <div className="finn-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--income-color)" /> Achieved Milestones
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
            {completedGoals.map((goal: any, i: number) => (
              <div key={i} style={{ padding: '12px 20px', background: 'var(--income-bg)', borderRadius: '14px', border: '1px solid var(--income-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{CATEGORY_EMOJI[goal.category] || '🎉'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'line-through', opacity: 0.6 }}>{goal.title}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--income-color)' }}>{formatINR(goal.target_amount)} saved</div>
                </div>
                <CheckCircle size={18} color="var(--income-color)" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function GoalsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-xl"/>
      <div className="h-12 bg-muted rounded-xl"/>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-48 bg-muted rounded-2xl"/>
        <div className="h-48 bg-muted rounded-2xl"/>
      </div>
    </div>
  )
}
