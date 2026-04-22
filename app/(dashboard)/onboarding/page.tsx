'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Eye, TrendingUp, MessageCircle, ArrowRight, 
  ArrowLeft, Download, Sparkles, Upload, 
  ShieldCheck, Zap, LayoutDashboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileDropzone } from '@/components/upload/FileDropzone'
import { UploadProgress } from '@/components/upload/UploadProgress'
import { ParsePreview, UploadResult } from '@/components/upload/ParsePreview'
import { downloadSampleCSV } from '@/utils/sampleData'
import { BackButton } from '@/components/common/BackButton'
import Link from 'next/link'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  
  // Upload states
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      filter: 'blur(10px)'
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)'
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      filter: 'blur(10px)'
    })
  }

  const nextStep = () => {
    setDirection(1)
    setStep(s => s + 1)
  }

  const prevStep = () => {
    setDirection(-1)
    setStep(s => s - 1)
  }

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResult(result)
    setIsProcessing(false)
    nextStep()
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] max-w-5xl mx-auto py-10 w-full relative">
      
      {/* ── STEP INDICATORS ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', background: 'var(--bg-elevated)', padding: '8px 16px', borderRadius: '999px', border: '1px solid var(--border-subtle)' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: step === i ? 'var(--accent-primary)' : step > i ? 'var(--income-color)' : 'var(--bg-surface)',
              color: step >= i ? '#ffffff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, transition: 'all 0.3s'
            }}>
              {step > i ? '✓' : i}
            </div>
            {i < 3 && <div style={{ width: '40px', height: '2px', background: step > i ? 'var(--income-color)' : 'var(--border-subtle)' }} />}
          </div>
        ))}
      </div>

      <div className="relative w-full flex flex-col items-center">
        <AnimatePresence mode="wait" custom={direction}>
          
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.5, ease: 'anticipate' }}
              className="flex flex-col items-center text-center w-full max-w-3xl"
            >
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '24px', 
                background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)', marginBottom: '30px'
              }}>
                <Sparkles size={40} color="white" />
              </div>

              <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-2px', marginBottom: '16px', lineHeight: 1 }}>
                Unleash your data.
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '48px', lineHeight: 1.5 }}>
                Upload your bank statements and let <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>FINN AI</span> rebuild your financial history with surgical precision.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', marginBottom: '48px' }}>
                {[
                  { icon: Eye, label: 'Deep Vision', desc: 'Identify every merchant', color: 'var(--accent-primary)', bg: 'var(--accent-soft)' },
                  { icon: Zap, label: 'Instant Audit', desc: 'Zero human effort', color: 'var(--savings-color)', bg: 'var(--savings-bg)' },
                  { icon: ShieldCheck, label: '100% Private', desc: 'Local processing', color: 'var(--income-color)', bg: 'var(--income-bg)' },
                ].map((f, idx) => (
                  <div key={idx} className="finn-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <f.icon size={20} style={{ color: f.color }} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{f.label}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={nextStep}
                style={{
                  padding: '16px 48px', borderRadius: '16px',
                  background: 'var(--accent-primary)', color: '#ffffff',
                  fontSize: '18px', fontWeight: 800, border: 'none', cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)',
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'transform 0.2s'
                }}
              >
                Launch Intelligence
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: UPLOAD */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.5, ease: 'anticipate' }}
              className="flex flex-col items-center w-full max-w-2xl"
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <button 
                  onClick={prevStep} disabled={isProcessing}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}
                >
                  <ArrowLeft size={16} /> Back to Start
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Need a template?</span>
                  <button 
                    onClick={downloadSampleCSV} disabled={isProcessing}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} /> Sample CSV
                  </button>
                </div>
              </div>

              <div className="finn-card" style={{ width: '100%', padding: '40px', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {!isProcessing ? (
                  <FileDropzone 
                    onUploadComplete={handleUploadComplete} 
                    onProcessingStart={handleProcessingStart}
                    onStepUpdate={setProcessingStep}
                  />
                ) : (
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px' }}>AI Engine Processing</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Extracting entities and normalizing transactions...</p>
                    <UploadProgress currentStep={processingStep} />
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>End-to-end encrypted. We never see your financial data.</span>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PREVIEW/RESULTS */}
          {step === 3 && uploadResult && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.5, ease: 'anticipate' }}
              className="flex flex-col items-center w-full max-w-4xl"
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>Extraction Success</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link href="/dashboard">
                    <button style={{ padding: '8px 20px', borderRadius: '10px', background: 'var(--accent-primary)', color: '#ffffff', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LayoutDashboard size={16} /> Go to Dashboard
                    </button>
                  </Link>
                </div>
              </div>
              <div className="finn-card" style={{ width: '100%', padding: '0px', overflow: 'hidden' }}>
                <ParsePreview result={uploadResult} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
