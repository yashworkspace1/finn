'use client'

import { useState } from 'react'
import { Bell, Smartphone, Monitor, ShieldAlert, Zap, Lock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)
  const [aiInsights, setAiInsights] = useState(true)
  
  return (
    <div className="flex flex-col gap-[24px] pb-[40px]">
      
      {/* ── HEADER ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-[var(--text-primary)] leading-none mb-2">
            Preferences
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            Customize your FINN experience and AI behaviors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        {/* Notifications */}
        <div className="finn-card p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-primary)]">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
              <p className="text-xs text-[var(--text-muted)]">Control how we contact you</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--text-primary)]">Email Summaries</span>
                <span className="text-xs text-[var(--text-muted)]">Weekly financial reports</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--accent-primary)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--text-primary)]">Push Alerts</span>
                <span className="text-xs text-[var(--text-muted)]">Unusual spending drops</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--accent-primary)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* AI Preferences */}
        <div className="finn-card p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">AI Brain Settings</h3>
              <p className="text-xs text-[var(--text-muted)]">Configure autonomous features</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--text-primary)]">Proactive Insights</span>
                <span className="text-xs text-[var(--text-muted)]">FINN suggests savings autonomously</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={aiInsights} onChange={() => setAiInsights(!aiInsights)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Linked Devices */}
        <div className="finn-card p-6 md:p-8 flex flex-col gap-6 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--income-bg)] flex items-center justify-center text-[var(--income-color)]">
              <Monitor size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">Linked Devices</h3>
              <p className="text-xs text-[var(--text-muted)]">Manage active sessions</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-subtle)]">
                  <Monitor size={18} className="text-[var(--text-primary)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--text-primary)]">MacBook Pro (Current)</span>
                  <span className="text-xs text-green-500 font-semibold">Active now · Mumbai, IN</span>
                </div>
              </div>
              <Button variant="outline" className="h-8 text-xs font-bold" disabled>Current</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-subtle)]">
                  <Smartphone size={18} className="text-[var(--text-primary)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--text-primary)]">iPhone 14 Pro</span>
                  <span className="text-xs text-[var(--text-muted)]">Last active 2 days ago · Pune, IN</span>
                </div>
              </div>
              <Button variant="outline" className="h-8 text-xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500 border-red-500/20">Revoke</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
