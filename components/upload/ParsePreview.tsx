'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, ReceiptText, AlertTriangle, RepeatIcon, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface UploadResult {
  success: boolean
  count: number
  dateRange: { from: string; to: string }
  anomalies: number
  subscriptions: number
  categories: number
  detectedFormat?: string
  processingMs?: number
  preview: any[]
}

interface ParsePreviewProps {
  result: UploadResult
}

export function ParsePreview({ result }: ParsePreviewProps) {
  const router = useRouter()

  const cards = [
    { label: 'Transactions', value: result.count, icon: ReceiptText, color: 'text-blue-500' },
    { label: 'Categories', value: result.categories, icon: Calendar, color: 'text-violet-500' },
    { label: 'Anomalies', value: result.anomalies, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Subscriptions', value: result.subscriptions, icon: RepeatIcon, color: 'text-emerald-500' },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Analysis Complete!</h2>
        <p className="text-muted-foreground">
          Successfully processed data from {result.dateRange.from} to {result.dateRange.to}
        </p>
        {result.detectedFormat && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Building2 className="h-4 w-4 text-violet-500" />
            <Badge variant="outline" className="border-violet-500/40 text-violet-600 dark:text-violet-400 font-medium">
              Detected: {result.detectedFormat} format
            </Badge>
            {result.processingMs && (
              <Badge variant="secondary" className="text-xs text-muted-foreground">
                {result.processingMs}ms
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <motion.div key={c.label} variants={item}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Icon className={`h-8 w-8 mb-3 ${c.color}`} />
                  <p className="text-3xl font-bold">{c.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{c.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Preview Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border bg-card overflow-hidden"
      >
        <div className="bg-muted/50 px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Preview (First 5 records)</h3>
        </div>
        <div className="divide-y">
          {result.preview.map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="font-medium text-sm truncate">{tx.description}</span>
                <span className="text-xs text-muted-foreground">{tx.date}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {tx.category || 'Uncategorised'}
                </Badge>
                <span className={`font-medium ${tx.type === 'credit' ? 'text-emerald-500' : ''}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center pt-4"
      >
        <Button 
          size="lg" 
          onClick={() => window.location.href = '/dashboard'}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8 shadow-lg shadow-violet-500/20"
        >
          View Full Analysis
        </Button>
      </motion.div>
    </div>
  )
}
