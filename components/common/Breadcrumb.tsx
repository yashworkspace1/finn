'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const ROUTE_NAMES: Record<string, string> = {
  dashboard: 'Dashboard',
  spendlens: 'SpendLens',
  cashflow: 'CashFlow',
  chat: 'FINN Chat',
  reports: 'Reports',
  onboarding: 'Onboarding',
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
      <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" />
      </Link>
      {segments.map((seg, i) => (
        <div key={seg} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3" />
          {i === segments.length - 1 ? (
            <span className="text-foreground font-medium">{ROUTE_NAMES[seg] || seg}</span>
          ) : (
            <Link href={`/${segments.slice(0, i + 1).join('/')}`} className="hover:text-foreground transition-colors">
              {ROUTE_NAMES[seg] || seg}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
