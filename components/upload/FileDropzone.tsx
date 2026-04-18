'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, X, File, FileText, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { UploadResult } from './ParsePreview'

interface FileDropzoneProps {
  onUploadComplete: (result: UploadResult) => void
  onProcessingStart: () => void
  onStepUpdate: (step: number) => void
}

export function FileDropzone({ onUploadComplete, onProcessingStart, onStepUpdate }: FileDropzoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [days, setDays] = useState('30')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const validateAndAddFiles = (newFiles: File[]) => {
    const validTypes = ['text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    const maxSize = 10 * 1024 * 1024 // 10MB

    const validFiles = newFiles.filter(file => {
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        toast.error(`${file.name} is not a valid format.`)
        return false
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 10MB limit.`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const getFileIconColor = (name: string) => {
    if (name.endsWith('.csv')) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
    if (name.endsWith('.pdf')) return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
    if (name.endsWith('.xlsx')) return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
    return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10'
  }

  const handleSubmit = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    onProcessingStart()
    
    // Step 0: Parsing
    onStepUpdate(0)

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      formData.append('rangeType', 'preset')
      formData.append('days', days)

      // Simulate step delays for better UX since backend is fast
      await new Promise(r => setTimeout(r, 800))
      onStepUpdate(1) // Categorizing
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()

      await new Promise(r => setTimeout(r, 600))
      onStepUpdate(2) // Anomalies
      
      await new Promise(r => setTimeout(r, 600))
      onStepUpdate(3) // AI insights
      
      await new Promise(r => setTimeout(r, 800))
      onStepUpdate(4) // Done

      toast.success('Analysis complete!')
      onUploadComplete(result)

    } catch (err: any) {
      toast.error(err.message || 'Failed to analyze statement.')
      setIsUploading(false)
      // Reset steps if failed so they can try again if they want
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          isDragging 
            ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]' 
            : 'border-muted-foreground/25 hover:border-violet-500/50 hover:bg-muted/50'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".csv,.pdf,.xlsx"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        
        <div className="rounded-full bg-violet-100 p-4 mb-4 dark:bg-violet-900/20">
          <UploadCloud className="h-8 w-8 text-violet-600 dark:text-violet-400" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Drag & drop your statements</h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Supports CSV, PDF, and Excel files up to 10MB each
        </p>

        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">CSV</Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100">PDF</Badge>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">XLSX</Badge>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, i) => (
              <motion.div
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-md ${getFileIconColor(file.name)}`}>
                    {file.name.endsWith('.csv') ? <FileText className="h-4 w-4" /> : 
                     file.name.endsWith('.xlsx') ? <Table className="h-4 w-4" /> : 
                     <File className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Analysis Range</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '7 Days', value: '7' },
            { label: '30 Days', value: '30' },
            { label: '90 Days', value: '90' },
            { label: '1 Year', value: '365' },
          ].map(range => (
            <Badge
              key={range.value}
              variant={days === range.value ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-1.5 text-sm ${days === range.value ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              onClick={() => setDays(range.value)}
            >
              {range.label}
            </Badge>
          ))}
        </div>
      </div>

      <Button 
        className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md rounded-lg py-6 text-lg" 
        disabled={files.length === 0 || isUploading}
        onClick={handleSubmit}
      >
        {isUploading ? 'Processing...' : 'Analyze Statement'}
      </Button>
    </div>
  )
}
