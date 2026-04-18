'use client'

import { motion } from 'framer-motion'
import { FileText, Tags, AlertCircle, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

interface UploadProgressProps {
  currentStep: number // 0 to 4 (4 means done)
}

const STEPS = [
  { id: 1, label: 'Parsing your statement', icon: FileText },
  { id: 2, label: 'Categorizing transactions', icon: Tags },
  { id: 3, label: 'Detecting anomalies', icon: AlertCircle },
  { id: 4, label: 'Generating AI insights', icon: Sparkles },
]

export function UploadProgress({ currentStep }: UploadProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-xl border bg-card shadow-sm">
      <h3 className="text-lg font-semibold mb-6 text-center">Processing Statement</h3>
      <div className="space-y-6">
        {STEPS.map((step, index) => {
          const isDone = currentStep > index
          const isActive = currentStep === index
          const isPending = currentStep < index
          const Icon = step.icon

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="relative flex items-center justify-center">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <CheckCircle2 className="h-6 w-6" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="text-violet-500"
                  >
                    <Loader2 className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <div className="text-muted-foreground/30">
                    <Icon className="h-6 w-6" />
                  </div>
                )}

                {/* Pulsing effect for active step */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-violet-500"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </div>

              <span
                className={`text-sm font-medium transition-colors ${
                  isDone
                    ? 'text-muted-foreground line-through decoration-muted-foreground/50'
                    : isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground/50'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
