'use client'

import { CreditCard, CheckCircle, Sparkles, Download, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-[24px] pb-[40px]">
      
      {/* ── HEADER ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-[var(--text-primary)] leading-none mb-2">
            Billing & Plans
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            Manage your subscription, payment methods, and invoices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {/* Current Plan */}
        <div className="lg:col-span-2">
          <div className="finn-card p-6 md:p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--accent-primary)] opacity-10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold uppercase tracking-wider w-max">
                  <Sparkles size={12} /> PRO PLAN
                </div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">₹499<span className="text-sm text-[var(--text-muted)] font-bold">/month</span></h2>
                <p className="text-sm text-[var(--text-secondary)] font-medium">Next billing date is May 15, 2026</p>
              </div>
              
              <Button variant="outline" className="h-10 px-6 font-bold border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">
                Manage Subscription
              </Button>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-6 relative z-10">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Plan Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Unlimited receipt parses/month',
                  'Advanced AI financial insights',
                  'Custom budgeting algorithms',
                  'Priority email support',
                  'Export reports to CSV/PDF',
                  'Multiple connected banks'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-[var(--income-color)]" />
                    <span className="text-sm font-semibold text-[var(--text-secondary)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="lg:col-span-1 flex flex-col gap-[24px]">
          <div className="finn-card p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <h3 className="font-bold text-[var(--text-primary)]">Payment Method</h3>
              <CreditCard size={18} className="text-[var(--text-muted)]" />
            </div>
            
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-between group cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-6 bg-gradient-to-tr from-gray-900 to-gray-600 rounded flex items-center justify-center shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-red-500 opacity-80 mix-blend-screen -mr-1"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80 mix-blend-screen"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--text-primary)]">Mastercard ending in 4242</span>
                  <span className="text-xs text-[var(--text-muted)]">Expires 12/28</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full text-sm font-bold text-[var(--accent-primary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-primary)]">
              + Add Payment Method
            </Button>
          </div>

          <div className="finn-card p-6 flex flex-col gap-4 bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-2">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] leading-tight">Need custom integrations?</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Contact us for enterprise API access or custom financial models.
            </p>
            <Button className="w-full mt-2 font-bold bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90">
              Contact Sales <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Invoice History */}
        <div className="lg:col-span-3">
          <div className="finn-card p-6 md:p-8">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-subtle)] pb-4">
              Invoice History
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="pb-3 px-4 font-bold">Date</th>
                    <th className="pb-3 px-4 font-bold">Amount</th>
                    <th className="pb-3 px-4 font-bold">Plan</th>
                    <th className="pb-3 px-4 font-bold text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: 'Apr 15, 2026', amount: '₹499', plan: 'Pro Monthly' },
                    { date: 'Mar 15, 2026', amount: '₹499', plan: 'Pro Monthly' },
                    { date: 'Feb 15, 2026', amount: '₹499', plan: 'Pro Monthly' },
                  ].map((inv, i) => (
                    <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors group">
                      <td className="py-4 px-4 text-sm font-bold text-[var(--text-primary)]">{inv.date}</td>
                      <td className="py-4 px-4 text-sm font-bold text-[var(--text-secondary)]">{inv.amount}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-[var(--text-muted)]">
                        <div className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          {inv.plan}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                          <Download size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
