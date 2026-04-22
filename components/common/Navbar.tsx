import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, LayoutDashboard, Sun, Moon, User, CreditCard, Bell, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const router = useRouter()

  const toggleTheme = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      setTheme('light')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      setTheme('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      setTheme('light')
    }
  }, [setTheme])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-[12px]"
    >
      <div className="flex h-16 items-center justify-between px-8">
        
        {/* Left Section: Welcome Message */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-[var(--text-primary)] leading-none">
              Financial Control
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
              Active Session · {user?.email?.split('@')[0]}
            </p>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3">
          
          {/* AI Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">AI Engine Ready</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl w-10 h-10 hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[var(--text-secondary)]" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[var(--text-secondary)]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl w-10 h-10 hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">Pro Member</span>
                  </div>
                  <Avatar className="h-9 w-9 rounded-xl border border-[var(--border-subtle)] transition-transform group-hover:scale-105">
                    <AvatarFallback className="bg-[var(--accent-primary)] text-white font-black text-sm rounded-xl">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold text-[var(--text-primary)]">{user.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Free Tier Account</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
                <DropdownMenuGroup className="p-1">
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl cursor-pointer py-2.5">
                    <User className="mr-3 h-4 w-4 text-[var(--text-secondary)]" />
                    <span className="text-sm font-semibold">Account Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/billing')} className="rounded-xl cursor-pointer py-2.5">
                    <Sparkles className="mr-3 h-4 w-4 text-[var(--accent-primary)]" />
                    <span className="text-sm font-semibold">Upgrade to Pro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-xl cursor-pointer py-2.5">
                    <Settings className="mr-3 h-4 w-4 text-[var(--text-secondary)]" />
                    <span className="text-sm font-semibold">Preferences</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
                <DropdownMenuGroup className="p-1">
                  <DropdownMenuItem onClick={() => signOut()} className="rounded-xl cursor-pointer py-2.5 text-red-500 focus:text-red-500 focus:bg-red-500/10">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="text-sm font-bold">Secure Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.header>
  )
}
