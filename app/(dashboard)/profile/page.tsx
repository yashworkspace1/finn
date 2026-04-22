'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Shield, Camera, Save, Key, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  return (
    <div className="flex flex-col gap-[24px] pb-[40px]">
      
      {/* ── HEADER ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-[var(--text-primary)] leading-none mb-2">
            Profile Settings
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            Manage your personal information and security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 flex flex-col gap-[24px]">
          <div className="finn-card p-6 flex flex-col items-center text-center">
            <div className="relative mb-6 group cursor-pointer">
              <div className="w-[100px] h-[100px] rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-4xl font-black shadow-[0_0_40px_rgba(124,58,237,0.3)]">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              {user?.email?.split('@')[0]}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-xs font-bold uppercase tracking-wider mb-4">
              <Shield size={12} /> Pro Member
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Member since {new Date().getFullYear()}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="finn-card p-4 flex flex-col gap-2">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors text-left group">
              <Key size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
              <span className="text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Change Password</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 transition-colors text-left group">
              <Trash2 size={16} className="text-red-500/70 group-hover:text-red-500" />
              <span className="text-sm font-semibold text-red-500/70 group-hover:text-red-500">Delete Account</span>
            </button>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <div className="finn-card p-6 md:p-8">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-subtle)] pb-4">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">First Name</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <Input defaultValue={user?.email?.split('@')[0]} className="pl-10 h-12 bg-[var(--bg-elevated)] border-[var(--border-subtle)]" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Last Name</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <Input placeholder="Enter your last name" className="pl-10 h-12 bg-[var(--bg-elevated)] border-[var(--border-subtle)]" />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <Input disabled value={user?.email || ''} className="pl-10 h-12 bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-70" />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Phone Number</Label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <Input placeholder="+91 98765 43210" className="pl-10 h-12 bg-[var(--bg-elevated)] border-[var(--border-subtle)]" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="h-12 px-8 bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold gap-2 shadow-[0_10px_20px_rgba(124,58,237,0.2)]">
                <Save size={18} />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
