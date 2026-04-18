'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Brain, Eye, TrendingUp, MessageCircle, FileText, LogOut, Upload, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Brain', href: '/brain', icon: Brain },
  { label: 'SpendLens', href: '/spendlens', icon: Eye },
  { label: 'CashFlow', href: '/cashflow', icon: TrendingUp },
  { label: 'FINN Chat', href: '/chat', icon: MessageCircle },
  { label: 'Reports', href: '/reports', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      {/* Logo Area */}
      <Link href="/dashboard" className="flex h-16 items-center px-6 border-b">
        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-2xl font-bold text-transparent tracking-tight">
          FINN
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-violet-50 dark:text-violet-50'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-violet-600"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`relative z-10 h-4 w-4 ${isActive ? 'text-violet-50' : ''}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Profile Area */}
      {user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-100">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{user.email?.split('@')[0]}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 mb-2">
            <Link href="/onboarding" className="block">
              <button className="w-full px-3 py-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors">
                <Upload className="w-3 h-3" />
                Re-upload statement
              </button>
            </Link>
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to clear all your financial data? This cannot be undone.')) {
                  try {
                    const res = await fetch('/api/transactions/clear', { method: 'POST' })
                    if (res.ok) {
                      window.location.href = '/onboarding'
                    }
                  } catch (err) {
                    console.error(err)
                  }
                }
              }}
              className="w-full px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear all data
            </button>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      )}
    </aside>
  )
}
