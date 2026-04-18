'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, TrendingUp, MessageCircle, ArrowRight, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileDropzone } from '@/components/upload/FileDropzone'
import { UploadProgress } from '@/components/upload/UploadProgress'
import { ParsePreview, UploadResult } from '@/components/upload/ParsePreview'
import { downloadSampleCSV } from '@/utils/sampleData'
import { BackButton } from '@/components/common/BackButton'

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
      x: dir > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0
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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-10 w-full max-w-4xl mx-auto relative">
      
      <div className="absolute top-4 left-4 sm:left-8">
        <BackButton href="/dashboard" label="Home" className="" />
      </div>

      {/* Step Indicators */}
      <div className="flex gap-3 mb-12">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-300 ${
              step === i ? 'w-8 bg-violet-600' : 
              step > i ? 'w-4 bg-violet-600/50' : 'w-2 bg-muted'
            }`} 
          />
        ))}
      </div>

      <div className="relative w-full flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col items-center text-center px-4"
            >
              <div className="mb-6 rounded-full bg-violet-100 p-6 dark:bg-violet-900/20 shadow-xl shadow-violet-500/10">
                <span className="bg-gradient-to-br from-violet-500 to-fuchsia-500 bg-clip-text text-5xl font-extrabold text-transparent tracking-tighter">
                  FINN
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to FINN</h1>
              <p className="text-xl text-muted-foreground max-w-lg mb-12">
                Your AI-powered Personal CFO. Upload your statements and instantly unlock deep insights into your financial life.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
                <div className="flex flex-col items-center p-6 rounded-2xl border bg-card/50 shadow-sm">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl mb-4">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">SpendLens</h3>
                  <p className="text-sm text-muted-foreground">Discover where your money really goes</p>
                </div>
                <div className="flex flex-col items-center p-6 rounded-2xl border bg-card/50 shadow-sm">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl mb-4">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">CashFlow</h3>
                  <p className="text-sm text-muted-foreground">Predict shortfalls before they happen</p>
                </div>
                <div className="flex flex-col items-center p-6 rounded-2xl border bg-card/50 shadow-sm">
                  <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl mb-4">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">FinChat</h3>
                  <p className="text-sm text-muted-foreground">Chat with your financial data naturally</p>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={nextStep}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-12 py-6 text-lg group shadow-lg shadow-violet-500/20"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: UPLOAD */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col items-center px-4 w-full"
            >
              <div className="w-full flex justify-between items-center mb-8">
                <Button variant="ghost" onClick={prevStep} disabled={isProcessing}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Don't have a statement?</span>
                  <Button variant="outline" size="sm" onClick={downloadSampleCSV} disabled={isProcessing}>
                    <Download className="mr-2 w-4 h-4" />
                    Sample CSV
                  </Button>
                </div>
              </div>

              {!isProcessing ? (
                <FileDropzone 
                  onUploadComplete={handleUploadComplete} 
                  onProcessingStart={handleProcessingStart}
                  onStepUpdate={setProcessingStep}
                />
              ) : (
                <UploadProgress currentStep={processingStep} />
              )}
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 3 && uploadResult && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col items-center px-4 w-full"
            >
              <ParsePreview result={uploadResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
