'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export function BackButton({
  label = 'Back',
  href,
  className = "mb-6"
}: {
  label?: string
  href?: string
  className?: string
}) {
  const router = useRouter()

  return (
    <motion.button
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => href ? router.push(href) : router.back()}
      className={`flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group ${className}`}
    >
      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </motion.button>
  )
}
