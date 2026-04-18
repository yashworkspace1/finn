'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface HealthScoreProps {
  score: number
  grade: string
  size?: 'sm' | 'md' | 'lg'
}

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const SIZE_MAP = {
  sm: 100,
  md: 130,
  lg: 160,
}

export function HealthScore({ score, grade, size = 'lg' }: HealthScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const dim = SIZE_MAP[size]
  const cx = dim / 2
  const cy = dim / 2
  const r = size === 'lg' ? 54 : size === 'md' ? 44 : 34
  const circ = 2 * Math.PI * r
  const offset = circ - (animatedScore / 100) * circ

  const color =
    score >= 71
      ? '#10b981'
      : score >= 41
      ? '#f59e0b'
      : '#f43f5e'

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 150)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={dim}
        height={dim}
        className="-rotate-90"
        style={{ overflow: 'visible' }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="10"
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-3xl font-bold tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {Math.round(animatedScore)}
        </motion.span>
        <span className="text-sm font-semibold" style={{ color }}>
          Grade {grade}
        </span>
        <span className="text-xs text-muted-foreground">Health Score</span>
      </div>
    </div>
  )
}
