'use client'

import { createClient } from '@/lib/database/supabaseClient'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Sparkles, ShieldCheck, Mail, Lock, Globe, Code2, ArrowRight, UserPlus } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleEmailSignup() {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      toast.success('Account created successfully!')
      router.push('/onboarding')
    } catch (error: any) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/api/auth/callback` }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Google signup failed')
      setGoogleLoading(false)
    }
  }

  async function handleGithubSignup() {
    setGithubLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/api/auth/callback` }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'GitHub signup failed')
      setGithubLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] relative overflow-hidden p-4">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent-primary)] opacity-[0.03] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--savings-color)] opacity-[0.03] rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '20px', 
            background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)', marginBottom: '20px'
          }}>
            <UserPlus size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1.5px', marginBottom: '4px' }}>
            Start Your Journey
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>Create your private FINN account in seconds</p>
        </div>

        <div className="finn-card" style={{ padding: '40px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)' }}>
          
          {/* Social Auth */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleGoogleSignup} disabled={googleLoading}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
            >
              {googleLoading ? <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" /> : <Globe size={18} />}
              Sign up with Google
            </button>
            <button 
              onClick={handleGithubSignup} disabled={githubLoading}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
            >
              {githubLoading ? <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" /> : <Code2 size={18} />}
              Sign up with GitHub
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>or register</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Email Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              onClick={handleEmailSignup} disabled={loading || !email || !password || !confirmPassword}
              style={{ 
                width: '100%', padding: '14px', borderRadius: '12px', 
                background: 'var(--accent-primary)', color: '#ffffff',
                fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '10px'
              }}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Already have an account? <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>Sign In</Link>
            </p>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} />
          <span style={{ fontSize: '11px', fontWeight: 700 }}>Your privacy is our priority. No data leaks.</span>
        </div>
      </motion.div>
    </div>
  )
}
