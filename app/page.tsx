'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  LayoutDashboard, Play, Brain, Eye, TrendingUp, MessageCircle, FileText, 
  GitCompare, Calendar, Droplets, PieChart, Receipt, Gauge, 
  Store, Target, BadgePercent, Sparkles 
} from 'lucide-react'
import { useEffect, useRef } from 'react'

// Animations helper
const fadeInUp: any = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
  viewport: { once: true }
}

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let stars: any[] = []
    let animationFrameId: number

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function createStars() {
      stars = []
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 1.2 + 0.2,
          o: Math.random() * 0.7 + 0.1,
          speed: Math.random() * 0.3 + 0.05
        })
      }
    }

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.o})`
        ctx.fill()
        s.o += (Math.random() - 0.5) * 0.02
        s.o = Math.max(0.05, Math.min(0.9, s.o))
      })
      animationFrameId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', () => { resize(); createStars(); })
    resize()
    createStars()
    draw()

    // Scroll reveal logic
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-section').forEach(el => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(30px) scale(0.95)';
      (el as HTMLElement).style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
      
      {/* Galaxy Background Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep space base */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120,40,220,0.18) 0%, transparent 60%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(80,0,180,0.12) 0%, transparent 55%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 40% 30% at 20% 50%, rgba(168,85,247,0.1) 0%, transparent 50%)'
        }} />

        {/* EXTRA LIGHT HERO GLOW */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '60%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.04), transparent 70%)',
          filter: 'blur(100px)'
        }} />

        {/* Star field */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        {/* Hollow rings */}
        <div className="animate-ring-pulse" style={{
          position: 'absolute', top: '50%', right: '8%', transform: 'translateY(-50%)',
          width: '520px', height: '520px', borderRadius: '50%',
          border: '1px solid rgba(168,85,247,0.08)',
          boxShadow: '0 0 60px rgba(168,85,247,0.04), inset 0 0 60px rgba(168,85,247,0.04)'
        }} />
      </div>

      {/* SECTION 1 — Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 border-b border-white/[0.04] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#a855f7] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <span className="text-xl font-black tracking-tight">FINN</span>
          </div>

          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="hidden md:flex">
            {['Features', 'How it works', 'Pricing', 'About'].map(link => (
              <Link key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#ffffff'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
              >{link}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href="/login">
              <button style={{ padding: '8px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Log In</button>
            </Link>
            <Link href="/signup">
              <button className="ripple-btn" style={{ padding: '8px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', fontSize: '12px', color: 'white', fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 0 20px rgba(168,85,247,0.35)' }}>Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 2 — Hero */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative">
          <motion.div {...fadeInUp} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-blink" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c4b5fd]">AI-Powered Personal Finance Intelligence</span>
            </div>

            <h1 className="text-[56px] md:text-[84px] font-black leading-[0.9] tracking-[-3px] mb-8">
              Simplifying<br />
              <span className="text-white/25">Your Most</span><br />
              Complex Finances
            </h1>

            <p className="text-sm text-white/30 max-w-[340px] leading-relaxed mb-10">
              The first financial co-pilot that actually understands your bank statements as deeply as a professional CFO.
            </p>

            <div className="flex flex-wrap items-center gap-5 mb-12">
              <Link href="/signup">
                <button className="ripple-btn px-10 py-5 bg-white text-black font-black text-sm rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  Get started free
                </button>
              </Link>
              <button className="flex items-center gap-3 px-6 py-4 text-white/70 hover:text-white transition-all group">
                <div className="w-10 h-10 rounded-full border border-white/12 flex items-center justify-center group-hover:border-white/30">
                  <Play size={14} fill="currentColor" />
                </div>
                <span className="text-sm font-bold">See how it works</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column — 3D Floating Objects */}
          <div className="relative h-[500px] perspective-[800px] hidden lg:block">
            <div className="absolute top-0 right-10 z-20 animate-float-1">
              <div className="w-[120px] h-[80px] bg-[#1a1a2e]/60 border-2 border-[#f87171]/40 backdrop-blur-xl rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_20px_rgba(248,113,113,0.3)] animate-pulse-ring">
                <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider">Health Score</div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-black text-white leading-none">35</div>
                  <div className="text-[9px] font-black text-[#f87171] bg-[#f87171]/10 px-1.5 py-0.5 rounded">Grade D</div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-float-2">
              <div className="w-[180px] h-[110px] rounded-[100%] border-[3px] border-[#a855f7]/80 bg-[#7828dc]/30 backdrop-blur-xl animate-pulse-ring flex flex-col items-center justify-center p-6 text-center">
                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Monthly Income</div>
                <div className="text-3xl font-black text-white mb-1">₹35,039</div>
              </div>
            </div>
            <div className="absolute bottom-10 left-10 z-20 animate-float-3">
              <div className="w-[120px] h-[80px] bg-[#1a1a2e]/60 border-2 border-[#34d399]/40 backdrop-blur-xl rounded-[40px] p-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse-ring">
                <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider mb-1">SAVINGS RATE</div>
                <div className="text-2xl font-black text-white">0.1%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Floating Bank Logos */}
      <section className="py-20 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="text-[9px] font-black uppercase tracking-[2px] text-white/10 text-center">Supported Institutional Partners</div>
        </div>
        <div className="flex overflow-hidden group">
          <div className="flex gap-20 animate-scroll py-4 group-hover:pause-animation">
            {['HDFC BANK', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'YES BANK', 'INDUSIND', 'IDFC FIRST', 'HSBC', 'DBS'].map(bank => (
              <span key={bank} className="text-lg font-black text-white/10 tracking-[4px] whitespace-nowrap hover:text-[#a855f7]/40 transition-colors cursor-default">{bank}</span>
            ))}
            {/* Duplicate for infinite scroll */}
            {['HDFC BANK', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'YES BANK', 'INDUSIND', 'IDFC FIRST', 'HSBC', 'DBS'].map(bank => (
              <span key={bank + '_2'} className="text-lg font-black text-white/10 tracking-[4px] whitespace-nowrap hover:text-[#a855f7]/40 transition-colors cursor-default">{bank}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" style={{ padding: '120px 48px', position: 'relative', zIndex: 10, borderTop: '1px solid rgba(168,85,247,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }} className="reveal-section">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '999px', padding: '6px 16px', fontSize: '10px', color: '#a855f7', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px' }}>
            <Sparkles size={12} /> Full Suite Features
          </div>
          <h2 style={{ fontSize: '52px', fontWeight: 900, color: '#ffffff', letterSpacing: '-2px', lineHeight: 1, marginBottom: '20px' }}>
            15 powerful features.<br />
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>One autonomous co-pilot.</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            The most complete financial analysis engine ever built for personal use. No manual entry, just pure intelligence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { num: '01', icon: <LayoutDashboard />, title: 'Dashboard', desc: 'Real-time overview of your net worth, health score, and cashflow signals.', color: '#a855f7', href: '/dashboard' },
            { num: '02', icon: <Brain />, title: 'AI Brain', desc: 'Autonomous pattern recognition that spots spending trends you missed.', color: '#34d399', href: '/brain' },
            { num: '03', icon: <Eye />, title: 'SpendLens', desc: 'Interactive visual layer to dissect every single category of your life.', color: '#60a5fa', href: '/spendlens' },
            { num: '04', icon: <TrendingUp />, title: 'CashFlow', desc: 'Predictive forecasting for next month based on historical data.', color: '#fbbf24', href: '/cashflow' },
            { num: '05', icon: <MessageCircle />, title: 'FINN Chat', desc: 'Natural language finance expert. Ask "Can I afford a vacation?" get an answer.', color: '#f472b6', href: '/chat' },
            { num: '06', icon: <FileText />, title: 'Reports', desc: 'Executive-level PDF/XLSX summaries for tax and financial planning.', color: '#a78bfa', href: '/reports' },
            { num: '07', icon: <GitCompare />, title: 'Compare', desc: 'Deep surgical comparison between any two months or years.', color: '#fb923c', href: '/compare' },
            { num: '08', icon: <Calendar />, title: 'Calendar', desc: 'Heatmap of every spending day. Spot salary spikes and patterns.', color: '#34d399', href: '/calendar' },
            { num: '09', icon: <Droplets />, title: 'Money Leaks', desc: 'Identify bank charges, penalties, and hidden leaks automatically.', color: '#f87171', href: '/leaks' },
            { num: '10', icon: <PieChart />, title: '50/30/20 Check', desc: 'Automatic budget auditing against the golden rules of finance.', color: '#60a5fa', href: '/budget' },
            { num: '11', icon: <Receipt />, title: 'Bills & EMI', desc: 'Never miss a payment. Auto-detects upcoming bills from history.', color: '#fbbf24', href: '/bills' },
            { num: '12', icon: <Gauge />, title: 'Runway', desc: 'Calculates exactly how many months you survive without income.', color: '#34d399', href: '/runway' },
            { num: '13', icon: <Store />, title: 'Merchants', desc: 'Intelligent merchant profiling. See where your money actually goes.', color: '#a855f7', href: '/merchants' },
            { num: '14', icon: <Target />, title: 'Goal Tracker', desc: 'Set and track financial milestones with real-time progress bars.', color: '#fb923c', href: '/goals' },
            { num: '15', icon: <BadgePercent />, title: 'Tax Readiness', desc: 'Auto-classify 80C, HRA, and business expenses for filing.', color: '#a78bfa', href: '/tax' },
          ].map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, type: 'spring', stiffness: 100 }}
              className="feature-card reveal-section"
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(168,85,247,0.08)',
                borderRadius: '20px',
                padding: '32px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${f.color}40, transparent)` }} />
              <div style={{ fontSize: '10px', fontWeight: 800, color: `${f.color}80`, letterSpacing: '2px', marginBottom: '20px' }}>FEATURE {f.num}</div>
              <div className="feature-card-icon" style={{ color: f.color, marginBottom: '16px' }}>{f.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '10px', letterSpacing: '-0.5px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{f.desc}</div>
              <Link href={f.href} className="stretched-link" style={{ position: 'absolute', inset: 0 }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — How It Works */}
      <section id="how-it-works" style={{
        padding: '80px 48px',
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(168,85,247,0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }} className="reveal-section">
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', marginBottom: '10px' }}>
            Three steps.{' '}
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>Total clarity.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'Upload your statement', desc: 'Drag and drop any CSV, PDF, or XLSX from any Indian bank. Takes 3 seconds.', icon: '📤', color: '#a855f7' },
            { step: '02', title: 'FINN analyses everything', desc: 'AI reads every transaction, categorises, detects anomalies, calculates scores — in under 10 seconds.', icon: '🧠', color: '#34d399' },
            { step: '03', title: 'Get your CFO briefing', desc: 'Dashboard, calendar, insights, tax readiness, runway — all populated instantly with your real data.', icon: '📊', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={s.step} style={{
              background: 'rgba(255,255,255,0.015)',
              border: `1px solid ${s.color}20`,
              borderRadius: '16px',
              padding: '28px 24px',
              position: 'relative',
              overflow: 'hidden',
              opacity: 0,
              animation: `revealUp 0.6s ease forwards ${i * 0.15}s`
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)`
              }} />
              <div style={{ fontSize: '28px', marginBottom: '16px' }}>{s.icon}</div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: `${s.color}70`, letterSpacing: '2px', marginBottom: '8px' }}>STEP {s.step}</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.3px' }}>{s.title}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — About */}
      <section id="about" style={{
        padding: '80px 48px',
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(168,85,247,0.06)'
      }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto', textAlign: 'center',
          opacity: 0, animation: 'revealUp 0.6s ease forwards 0.1s'
        }} className="reveal-section">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(168,85,247,0.08)',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '999px', padding: '5px 14px',
            fontSize: '9px', color: 'rgba(168,85,247,0.7)',
            fontWeight: 700, letterSpacing: '2px',
            textTransform: 'uppercase', marginBottom: '20px'
          }}>About FINN</div>

          <h2 style={{
            fontSize: '32px', fontWeight: 900, color: '#ffffff',
            letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '20px'
          }}>
            Built for real people,<br/>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>not spreadsheet nerds.</span>
          </h2>

          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, marginBottom: '16px' }}>
            FINN was built because most finance apps make you manually track every expense. Nobody does that. We believe your bank statement already has everything — it just needs someone smart enough to read it.
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, marginBottom: '32px' }}>
            Upload once. Get the kind of analysis only a CFO could give you — instantly, privately, and completely free.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {[
              { val: '15', label: 'Financial Features' },
              { val: '3', label: 'AI Models' },
              { val: '∞', label: 'Months of history' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(168,85,247,0.05)',
                border: '1px solid rgba(168,85,247,0.12)',
                borderRadius: '12px', padding: '20px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#a855f7', marginBottom: '4px' }}>{s.val}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <Link href="/signup">
            <button className="ripple-btn" style={{
              padding: '14px 32px', borderRadius: '999px',
              background: '#ffffff', fontSize: '13px',
              color: '#000000', fontWeight: 800,
              cursor: 'pointer', border: 'none'
            }}>Start for free — no card needed</button>
          </Link>
        </div>
      </section>

      {/* SECTION 7 — Footer */}
      <footer className="py-20 px-6 border-t border-white/[0.04] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#a855f7] flex items-center justify-center">
                <span className="text-white font-black text-xs">F</span>
              </div>
              <span className="font-black text-lg">FINN</span>
            </div>
            <span className="text-[10px] font-bold text-white/20 tracking-wider">built for voidhack april 2026</span>
          </div>

          <div className="flex items-center gap-8">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href="#" className="text-[11px] font-bold text-white/20 hover:text-white transition-colors">{link}</a>
            ))}
          </div>

          <div className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
            © 2026 FINN ANALYTICS
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .pause-animation {
          animation-play-state: paused;
        }
      `}</style>

    </div>
  )
}
