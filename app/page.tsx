'use client'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import Link from 'next/link'
import { Eye, TrendingUp, MessageCircle, Brain, Shield, Zap, ArrowRight, CheckCircle, Star, Upload, Sparkles, BarChart3, ChevronRight, Lock, Globe, Cpu, PieChart, BellRing, Wallet } from 'lucide-react'
import { Navbar } from '@/components/common/Navbar'

function CursorGlow() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 500, damping: 50 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 50 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX - 200)
      cursorY.set(e.clientY - 200)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none z-0 bg-violet-600/8 blur-3xl"
    />
  )
}

function GridBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"/>
    </div>
  )
}

function FloatingParticles() {
  const [particles, setParticles] = useState<any[]>([])

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    })))
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-500/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function TypewriterText({ texts }: { texts: string[] }) {
  const [current, setCurrent] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const text = texts[current]
    if (!isDeleting && displayed === text) {
      setTimeout(() => setIsDeleting(true), 2000)
      return
    }
    if (isDeleting && displayed === '') {
      setIsDeleting(false)
      setCurrent(prev => (prev + 1) % texts.length)
      return
    }
    const timeout = setTimeout(() => {
      setDisplayed(prev => isDeleting ? prev.slice(0, -1) : text.slice(0, prev.length + 1))
    }, isDeleting ? 50 : 100)
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, current, texts])

  return (
    <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-0.5 h-12 bg-violet-400 ml-1 align-middle"
      />
    </span>
  )
}

function AnimatedStatCard({ value, label, prefix = '', suffix = '', color, delay = 0 }: any) {
  const [ref, inView] = useInView({ triggerOnce: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className={`text-center p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl hover:border-${color}-500/50 transition-colors duration-300`}
    >
      <div className={`text-4xl font-bold text-${color}-400 mb-2`}>
        {prefix}
        {inView && <CountUp end={value} duration={2} delay={delay} />}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  )
}

function FeatureCard({ icon: Icon, title, description, color, stats, mockup, index }: any) {
  const [hovered, setHovered] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative p-6 bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden cursor-pointer group hover:border-violet-500/50 transition-all duration-300"
    >
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 bg-gradient-to-br from-${color}-600/10 to-${color}-600/5`}
      />
      <motion.div
        animate={{ x: hovered ? '200%' : '-100%' }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
      />
      <div className="relative">
        <motion.div
          animate={{ scale: hovered ? 1.1 : 1, rotate: hovered ? 5 : 0 }}
          className={`w-12 h-12 rounded-xl bg-${color}-600/20 flex items-center justify-center mb-4`}
        >
          <Icon className={`w-6 h-6 text-${color}-400`}/>
        </motion.div>
        <motion.span
          animate={{ y: hovered ? -2 : 0 }}
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full mb-3 bg-${color}-600/10 text-${color}-400 border border-${color}-600/20`}
        >
          <Sparkles className="w-3 h-3"/>
          {stats}
        </motion.span>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
        <motion.div
          animate={{ y: hovered ? -4 : 0, opacity: hovered ? 1 : 0.7 }}
          className="bg-background/50 rounded-xl p-3 border border-border/50"
        >
          {mockup}
        </motion.div>
        <motion.div
          animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0 }}
          className={`flex items-center gap-1 mt-3 text-sm text-${color}-400 font-medium`}
        >
          Learn more <ChevronRight className="w-3 h-3"/>
        </motion.div>
      </div>
    </motion.div>
  )
}

function SpendLensMockup() {
  return (
    <div className="space-y-2">
      {[
        { cat: 'Food & Dining', pct: 35, color: 'bg-violet-500' },
        { cat: 'Transport', pct: 20, color: 'bg-teal-500' },
        { cat: 'Shopping', pct: 25, color: 'bg-indigo-500' },
      ].map(item => (
        <div key={item.cat}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{item.cat}</span>
            <span className="font-medium">{item.pct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.pct}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full ${item.color} rounded-full`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function CashFlowMockup() {
  const points = [20,35,25,45,30,55,40,60,45,70]
  const max = Math.max(...points)
  return (
    <div className="flex items-end gap-1 h-12">
      {points.map((p, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(p/max)*100}%` }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
          className="flex-1 rounded-t-sm"
          style={{
            background: i >= 7 ? 'hsl(262 83% 68% / 0.4)' : 'hsl(262 83% 68% / 0.8)',
            borderTop: i >= 7 ? '1px dashed hsl(262 83% 68%)' : 'none'
          }}
        />
      ))}
    </div>
  )
}

function ChatMockup() {
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <div className="bg-violet-600/30 text-xs px-3 py-1.5 rounded-2xl rounded-tr-sm text-violet-300 max-w-[80%]">
          Where did I spend the most?
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">F</div>
        <div className="bg-muted/50 text-xs px-3 py-1.5 rounded-2xl rounded-tl-sm text-foreground max-w-[80%]">
          Food & Dining at ₹8,450 (35% of spend)
        </div>
      </div>
    </div>
  )
}

function BrainMockup() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="4"/>
          <motion.circle
            cx="24" cy="24" r="20" fill="none" stroke="hsl(262 83% 68%)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={125.6} initial={{ strokeDashoffset: 125.6 }} animate={{ strokeDashoffset: 31.4 }}
            transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-violet-400">74</div>
      </div>
      <div>
        <div className="text-xs font-bold">Weekend Warrior</div>
        <div className="text-xs text-muted-foreground">Grade A · Health Score</div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <GridBackground />
      <FloatingParticles />
      <CursorGlow />
      <Navbar />
      
      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center relative pt-16 px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600/10 border border-violet-600/30 rounded-full mb-8 backdrop-blur-sm"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-3.5 h-3.5 text-violet-400"/>
            </motion.div>
            <span className="text-xs text-violet-300 font-medium">Introducing FINN — AI-Powered Financial Intelligence</span>
            <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronRight className="w-3 h-3 text-violet-400"/>
            </motion.span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight">
              Your Money.<br/><TypewriterText texts={['Understood.', 'Predicted.', 'Optimized.', 'Mastered.']}/>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your bank statement and get an AI-powered financial brain that analyzes spending, predicts cashflow, and helps you build wealth.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsl(262 83% 58% / 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl flex items-center gap-2 text-base transition-colors relative overflow-hidden group"
              >
                <motion.div
                  animate={{ x: ['100%', '-100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />
                <span className="relative">Start for free</span>
                <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform"/>
              </motion.button>
            </Link>

            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-card/80 backdrop-blur-sm hover:bg-muted border border-border hover:border-violet-500/50 text-foreground font-semibold rounded-xl transition-all text-base"
              >
                Sign in
              </motion.button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-16">
            {[ { icon: Shield, text: 'Bank-grade encryption' }, { icon: Globe, text: '50+ banks supported' }, { icon: Zap, text: 'Results in 30 seconds' }, { icon: Lock, text: 'Your data stays private' }].map(({ icon: Icon, text }) => (
              <motion.div key={text} whileHover={{ y: -2 }} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-violet-400"/><span>{text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 80, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-violet-600/20 blur-3xl rounded-3xl"/>
            <div className="relative bg-card/90 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
                <div className="flex gap-1.5">
                  {['bg-red-500/70', 'bg-yellow-500/70', 'bg-green-500/70'].map((c, i) => <div key={i} className={`w-3 h-3 rounded-full ${c}`}/>)}
                </div>
                <div className="flex-1 bg-muted/50 rounded-md h-5 max-w-xs mx-auto flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">finn.app/dashboard</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Income', val: '₹53,125', color: 'text-teal-400', bg: 'bg-teal-500/10' },
                    { label: 'Expenses', val: '₹41,444', color: 'text-rose-400', bg: 'bg-rose-500/10' },
                    { label: 'Savings Rate', val: '22%', color: 'text-violet-400', bg: 'bg-violet-500/10' },
                    { label: 'Health Score', val: '74/100', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  ].map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }} className={`${card.bg} border border-border rounded-xl p-3`}>
                      <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                      <p className={`text-base font-bold ${card.color}`}>{card.val}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-background/50 border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium">Daily Spending</p><span className="text-xs text-muted-foreground">April 2026</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[30,60,40,80,50,70,45,90,55,75,40,85,60,95,50].map((h, i) => (
                        <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 1.2 + i * 0.03, duration: 0.4, ease: 'easeOut' }}
                          style={{ originY: 1, height: `${h}%`, background: i % 4 === 0 ? '#8b5cf6' : i % 4 === 1 ? '#6366f1' : i % 4 === 2 ? '#2dd4bf' : '#8b5cf680' }}
                          className="flex-1 rounded-t-sm"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-background/50 border border-border rounded-xl p-4 flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 mb-2">
                      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--border))" strokeWidth="6"/>
                        <motion.circle cx="32" cy="32" r="26" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" strokeDasharray="163.4" initial={{ strokeDashoffset: 163.4 }} animate={{ strokeDashoffset: 40.8 }} transition={{ delay: 1.5, duration: 1.5, ease: 'easeOut' }}/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-violet-400">74</div>
                    </div>
                    <p className="text-xs font-medium">Health Score</p><p className="text-xs text-violet-400">Grade A</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="absolute -right-6 top-20 bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-xl w-52">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-violet-400"/></div>
                <div><p className="text-xs font-semibold mb-0.5">AI Insight</p><p className="text-xs text-muted-foreground leading-relaxed">Reduce dining by 15% → save ₹1,200/month</p></div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }} className="absolute -left-6 bottom-24 bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-xl w-44">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><p className="text-xs font-semibold">CashFlow Alert</p>
              </div>
              <p className="text-xs text-muted-foreground">You're on track to save ₹11,681 this month 🎉</p>
            </motion.div>

            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }} className="absolute -right-4 bottom-16 bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-xl w-40">
              <div className="flex items-center gap-2 mb-1">
                <BellRing className="w-3.5 h-3.5 text-amber-400"/><p className="text-xs font-semibold">Subscription</p>
              </div>
              <p className="text-xs text-muted-foreground">Netflix · ₹649 due in 3 days</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* MARQUEE BANKS SECTION */}
      <section className="py-12 border-y border-border overflow-hidden">
        <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-widest">Works with all major banks</p>
        <div className="relative">
          <motion.div animate={{ x: [0, -1500] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="flex gap-8 whitespace-nowrap">
            {[...Array(3)].map((_, set) => (
              <div key={set} className="flex gap-8">
                {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Paytm', 'Chase', 'Barclays', 'HSBC', 'DBS', 'PhonePe', 'RBC', 'ANZ', 'Revolut', 'Monzo'].map(bank => (
                  <div key={`${set}-${bank}`} className="px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm text-muted-foreground flex-shrink-0">{bank}</div>
                ))}
              </div>
            ))}
          </motion.div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none"/>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none"/>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <motion.span initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-violet-400 mb-4">
              <Sparkles className="w-3 h-3"/>Features
            </motion.span>
            <h2 className="text-5xl font-bold mb-4">Four tools.<br/><span className="text-muted-foreground">One financial brain.</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Everything you need to understand, predict and optimize your finances.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Eye, title: 'SpendLens', description: 'Auto-categorize every transaction, detect unusual spending, track forgotten subscriptions and see exactly where your money goes.', color: 'violet', stats: 'Auto-categorizes 12+ types', mockup: <SpendLensMockup /> },
              { icon: TrendingUp, title: 'CashFlow Copilot', description: 'AI-powered predictions warn you about cash crunches before they happen. Stay ahead of your finances with 30-day forecasts.', color: 'teal', stats: '30-day cashflow forecast', mockup: <CashFlowMockup /> },
              { icon: MessageCircle, title: 'FINN Chat', description: 'Ask anything about your money in plain language. FINN knows your data and gives specific, personalized answers instantly.', color: 'indigo', stats: 'Powered by Gemini AI', mockup: <ChatMockup /> },
              { icon: Brain, title: 'AI Brain', description: 'Discover your financial personality type, get weekly AI nudges and a health score that tracks your improvement over time.', color: 'amber', stats: '6 personality types', mockup: <BrainMockup /> },
            ].map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 border-y border-border bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedStatCard value={50} suffix="+" label="Bank formats supported" color="violet" delay={0} />
            <AnimatedStatCard value={0} prefix="₹" label="Cost to get started" color="teal" delay={0.1} />
            <AnimatedStatCard value={30} suffix="s" label="Average analysis time" color="indigo" delay={0.2} />
            <AnimatedStatCard value={6} label="Personality types" color="amber" delay={0.3} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-violet-400 mb-4"><Cpu className="w-3 h-3"/>How it works</span>
            <h2 className="text-5xl font-bold mb-4">From statement<br/><span className="text-muted-foreground">to insights in seconds.</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"/>
            {[
              { step: '01', icon: Upload, title: 'Upload statement', desc: 'CSV, PDF or XLSX from any bank worldwide. Takes 5 seconds.', color: 'violet', detail: 'Supports SBI, HDFC, ICICI, Axis, Chase, Barclays + 44 more' },
              { step: '02', icon: Cpu, title: 'AI analyzes data', desc: 'Our engine categorizes, detects anomalies and calculates your health score.', color: 'teal', detail: '6 AI engines run in parallel in under 3 seconds' },
              { step: '03', icon: Sparkles, title: 'Get insights', desc: 'Personalized recommendations, predictions and your financial personality.', color: 'indigo', detail: 'Powered by Gemini 2.0 Flash with smart fallback' },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} whileHover={{ y: -6 }} className="relative text-center p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl hover:border-violet-500/50 transition-all duration-300">
                <motion.div whileHover={{ scale: 1.1 }} className={`w-20 h-20 rounded-2xl bg-${s.color}-600/15 border border-${s.color}-600/20 flex items-center justify-center mx-auto mb-4 relative`}>
                  <s.icon className={`w-9 h-9 text-${s.color}-400`}/>
                  <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-${s.color}-600 text-white text-xs font-bold flex items-center justify-center border-2 border-background`}>{i + 1}</div>
                </motion.div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">{s.desc}</p>
                <p className={`text-xs text-${s.color}-400 font-medium`}>{s.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-muted/20 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-1 mb-4">{[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400"/>)}</div>
            <h2 className="text-4xl font-bold mb-3">People love FINN</h2>
            <p className="text-muted-foreground">Real users. Real results.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya S.', role: 'Software Engineer, Bangalore', avatar: 'P', color: 'violet', text: 'FINN found 3 subscriptions I completely forgot about. Saving ₹1,200 every month now. The personality feature is hilarious accurate — I am 100% a Subscription Hoarder 😂', stars: 5 },
              { name: 'Rahul M.', role: 'Freelancer, Mumbai', avatar: 'R', color: 'teal', text: 'The cashflow predictions are honestly scary accurate. It warned me about a cash crunch 2 weeks before it happened. This is what I needed as a freelancer.', stars: 5 },
              { name: 'Ananya K.', role: 'Product Manager, Delhi', avatar: 'A', color: 'indigo', text: 'Finally understand where my salary goes every month. The FINN Chat is mind-blowing — I just ask questions and get real answers about MY money. 10/10', stars: 5 },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6, scale: 1.02 }} className="p-6 bg-card/80 backdrop-blur-sm border border-border rounded-2xl hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-5xl font-serif text-violet-600/10 leading-none select-none">"</div>
                <div className="flex gap-1 mb-4">{[...Array(t.stars)].map((_, s) => <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400"/>)}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${t.color}-600/20 flex items-center justify-center font-bold text-${t.color}-400 text-sm`}>{t.avatar}</div>
                  <div><p className="font-semibold text-sm">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AboutSection />

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative p-16 rounded-3xl overflow-hidden text-center bg-gradient-to-br from-violet-600/20 via-card/50 to-indigo-600/20 border border-violet-500/20 backdrop-blur-sm">
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-0 left-1/4 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"/>
            <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }} className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none"/>
            <div className="relative">
              <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-violet-600/30"><Brain className="w-10 h-10 text-white"/></motion.div>
              <h2 className="text-5xl font-bold mb-4">Ready to master<br/><span className="bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">your finances?</span></h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">Join thousands who use FINN to understand their spending, predict their cashflow and build wealth. Completely free.</p>
              <Link href="/signup">
                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px hsl(262 83% 58% / 0.5)' }} whileTap={{ scale: 0.95 }} className="px-12 py-5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-lg flex items-center gap-3 mx-auto transition-colors relative overflow-hidden group">
                  <motion.div animate={{ x: ['100%', '-100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"/>
                  <span className="relative">Get started for free</span><ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform"/>
                </motion.button>
              </Link>
              <p className="text-xs text-muted-foreground mt-6">No credit card · No limits · Your data stays private</p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                {[ { icon: Shield, text: 'Bank-grade security' }, { icon: Zap, text: 'Instant analysis' }, { icon: Globe, text: '50+ banks' }, { icon: CheckCircle, text: 'Always free' } ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 rounded-full border border-border text-xs text-muted-foreground"><Icon className="w-3 h-3 text-violet-400"/>{text}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function AboutSection() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-violet-400 mb-4"><Sparkles className="w-3 h-3"/>About FINN</span>
          <h2 className="text-5xl font-bold mb-4">Built to solve a<br/><span className="text-muted-foreground">real problem.</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">Most people are financially blind. They don't know where their money goes, can't predict problems, and existing tools are too complicated to actually use.</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">The problem with personal finance today</h3>
              <p className="text-muted-foreground leading-relaxed">Rich people have financial advisors who tell them exactly where their money goes, what risks they face, and how to grow their wealth. Everyone else gets a spreadsheet and a prayer.</p>
              <p className="text-muted-foreground leading-relaxed">FINN changes that. We built an AI-powered financial brain that gives everyone — from a college student in Bareilly to a freelancer in Pune — the same quality of financial intelligence that was previously only available to the wealthy.</p>
            </div>
            <motion.div whileHover={{ x: 4 }} className="pl-4 border-l-2 border-violet-500">
              <p className="text-lg font-medium text-foreground italic">"A CFO for normal people. Powered by AI. Available to everyone."</p>
              <p className="text-sm text-muted-foreground mt-2">— The FINN Mission</p>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Privacy first', desc: 'Your data is encrypted. We never sell it.' },
                { icon: Zap, title: 'Instant insights', desc: 'Analysis in under 30 seconds.' },
                { icon: Globe, title: 'Built for India', desc: 'Works with all Indian banks.' },
                { icon: Brain, title: 'AI-powered', desc: 'Gemini 2.0 Flash under the hood.' },
              ].map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 p-3 bg-card/50 border border-border rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/15 flex items-center justify-center flex-shrink-0"><v.icon className="w-4 h-4 text-violet-400"/></div>
                  <div><p className="text-sm font-semibold">{v.title}</p><p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="relative bg-card border border-border rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"/>
              <div className="space-y-4 relative">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Before vs After FINN</p>
                {[
                  { before: '❓ Where did my salary go?', after: '✅ Food 35%, Rent 25%, Saved 22%' },
                  { before: '😰 Will I have money next week?', after: '✅ Predicted surplus of ₹11,681' },
                  { before: '🤷 Am I saving enough?', after: '✅ Health Score 74/100 · Grade A' },
                  { before: '💸 What subscriptions do I have?', after: '✅ 6 found · Saving ₹1,200/mo' },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg text-sm text-muted-foreground">{item.before}</div>
                    <div className="flex justify-center"><motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} className="text-violet-500 text-xs">↓</motion.div></div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm text-violet-300">{item.after}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-4 -right-4 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-violet-600/30">Built for VoidHack 2026 🏆</motion.div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card/50 border border-border rounded-2xl p-8">
          <p className="text-center text-sm font-medium mb-6 text-muted-foreground">Built with modern technology</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { name: 'Next.js 16.2', color: 'bg-gray-500/10 text-gray-400' },
              { name: 'Supabase', color: 'bg-green-500/10 text-green-400' },
              { name: 'Gemini 2.0 Flash', color: 'bg-blue-500/10 text-blue-400' },
              { name: 'TypeScript', color: 'bg-blue-600/10 text-blue-300' },
              { name: 'TailwindCSS', color: 'bg-teal-500/10 text-teal-400' },
              { name: 'Framer Motion', color: 'bg-pink-500/10 text-pink-400' },
              { name: 'shadcn/ui', color: 'bg-violet-500/10 text-violet-400' },
              { name: 'Recharts', color: 'bg-orange-500/10 text-orange-400' },
              { name: 'Vercel', color: 'bg-gray-500/10 text-gray-400' },
            ].map((tech, i) => (
              <motion.div key={tech.name} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05, y: -2 }} className={`px-4 py-2 rounded-lg text-sm font-medium border border-border ${tech.color} cursor-default`}>{tech.name}</motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12 p-6 bg-violet-600/5 border border-violet-600/20 rounded-2xl">
          <p className="text-sm text-muted-foreground">🏆 Built for <span className="text-violet-400 font-semibold">VoidHack April 2026</span> · Theme: <span className="text-foreground font-medium">Intelligent Financial Analytics</span></p>
          <p className="text-xs text-muted-foreground mt-2">Deadline: April 22nd, 11:30 PM IST</p>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center"><Brain className="w-4 h-4 text-white"/></div>
          <span className="font-bold bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">FINN</span>
          <span className="text-muted-foreground text-sm">— Your Personal CFO</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">Built with ❤️ for VoidHack April 2026 · Intelligent Financial Analytics</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">Get started</Link>
        </div>
      </div>
    </footer>
  )
}
