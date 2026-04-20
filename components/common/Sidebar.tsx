'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Brain, Eye, TrendingUp, MessageCircle, FileText, LogOut, Upload, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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

  // Get display name: full_name > email prefix > 'U'
  const displayName = (user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      {/* Logo */}
      <Link href="/dashboard" className="flex h-16 items-center px-6 border-b transition-opacity hover:opacity-80">
        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-2xl font-bold text-transparent tracking-tight">
          FINN
        </span>
      </Link>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-violet-50 dark:text-violet-50'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-0.5'
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

      {/* Bottom User Section — upgraded */}
      {user && (
        <div className="border-t">
          {/* Action buttons */}
          <div className="px-3 pt-3 pb-1 flex flex-col gap-1">
            <Link href="/onboarding">
              <button className="w-full px-3 py-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-xs font-medium rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.01]">
                <Upload className="w-3 h-3" />
                Re-upload statement
              </button>
            </Link>
            <button
              onClick={async () => {
                if (window.confirm('Clear all your financial data? This cannot be undone.')) {
                  try {
                    const res = await fetch('/api/transactions/clear', { method: 'POST' })
                    if (res.ok) window.location.href = '/onboarding'
                  } catch { /* silent */ }
                }
              }}
              className="w-full px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-medium rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.01]"
            >
              <Trash2 className="w-3 h-3" />
              Clear all data
            </button>
          </div>

          {/* User row */}
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-violet-600 text-white text-sm font-semibold">
                {avatarLetter}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-sm font-medium leading-tight">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground leading-tight">{user.email}</span>
            </div>
            <button
              onClick={() => signOut()}
              title="Log out"
              className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
