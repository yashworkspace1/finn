import { Transaction } from '@/lib/parser/normalizer'

export interface PersonalityProfile {
  type: string
  emoji: string
  description: string
  strengths: string[]
  weaknesses: string[]
  tip: string
}

export const PERSONALITIES: Record<string, PersonalityProfile> = {
  'Weekend Warrior': {
    type: 'Weekend Warrior',
    emoji: '🎉',
    description: 'Your spending spikes on weekends. You work hard and reward yourself.',
    strengths: ['Enjoys life', 'Treats yourself'],
    weaknesses: ['Impulse weekend buys', 'Hard to track'],
    tip: 'Set a weekend budget cap to enjoy without guilt.',
  },
  'Subscription Hoarder': {
    type: 'Subscription Hoarder',
    emoji: '📦',
    description: "You have 5+ recurring subscriptions. Some you've probably forgotten about.",
    strengths: ['Values convenience', 'Tech-savvy'],
    weaknesses: ['Silent money drain', 'Unused services'],
    tip: "Audit your subscriptions monthly. Cancel what you haven't used in 30 days.",
  },
  'Impulse Spender': {
    type: 'Impulse Spender',
    emoji: '⚡',
    description: 'High anomaly count — you make unexpected large purchases.',
    strengths: ['Spontaneous', 'Lives in the moment'],
    weaknesses: ['Budget unpredictability', 'Regret purchases'],
    tip: 'Apply the 24-hour rule before any purchase over ₹2000.',
  },
  'Steady Saver': {
    type: 'Steady Saver',
    emoji: '🏦',
    description: 'Consistent spending, good savings rate. You are financially disciplined.',
    strengths: ['Disciplined', 'Predictable cash flow'],
    weaknesses: ['Might miss opportunities', 'Too conservative'],
    tip: 'Consider investing your savings for better returns.',
  },
  'Big Ticket Buyer': {
    type: 'Big Ticket Buyer',
    emoji: '🛍️',
    description: 'Few but large transactions. You prefer quality over quantity.',
    strengths: ['Intentional spending', 'Quality focused'],
    weaknesses: ['Cash flow gaps', 'Hard to budget'],
    tip: 'Keep an emergency fund of 3 months expenses for big purchase months.',
  },
  'Daily Spender': {
    type: 'Daily Spender',
    emoji: '☕',
    description: 'Many small daily transactions. Every day has multiple spends.',
    strengths: ['Aware of daily needs', 'Flexible'],
    weaknesses: ['Death by a thousand cuts', 'Hard to track'],
    tip: 'Small daily spends add up. Track your daily average.',
  },
}

type EnrichedTransaction = Transaction & {
  is_anomaly?: boolean
  is_subscription?: boolean
}

export function detectPersonality(transactions: EnrichedTransaction[]): PersonalityProfile {
  if (transactions.length === 0) return PERSONALITIES['Steady Saver']

  const scores: Record<string, number> = {}

  // Weekend Warrior: >40% of debit transactions on Sat/Sun
  const debits = transactions.filter((t) => t.type === 'debit')
  const weekendDebits = debits.filter((t) => {
    const day = new Date(t.date).getDay()
    return day === 0 || day === 6
  })
  if (debits.length > 0 && weekendDebits.length / debits.length > 0.4) {
    scores['Weekend Warrior'] = (scores['Weekend Warrior'] ?? 0) + 3
  }

  // Subscription Hoarder: >5 subscription transactions
  const subs = transactions.filter((t) => t.is_subscription || t.category === 'Subscriptions')
  if (subs.length > 5) {
    scores['Subscription Hoarder'] = (scores['Subscription Hoarder'] ?? 0) + 3
  }

  // Impulse Spender: >3 anomalies
  const anomalies = transactions.filter((t) => t.is_anomaly)
  if (anomalies.length > 3) {
    scores['Impulse Spender'] = (scores['Impulse Spender'] ?? 0) + 3
  }

  // Big Ticket Buyer: average debit amount > ₹5000
  if (debits.length > 0) {
    const avgDebit = debits.reduce((s, t) => s + t.amount, 0) / debits.length
    if (avgDebit > 5000) {
      scores['Big Ticket Buyer'] = (scores['Big Ticket Buyer'] ?? 0) + 3
    }
  }

  // Daily Spender: >2 transactions per unique day on average
  const uniqueDays = new Set(transactions.map((t) => t.date)).size
  if (uniqueDays > 0 && transactions.length / uniqueDays > 2) {
    scores['Daily Spender'] = (scores['Daily Spender'] ?? 0) + 3
  }

  // Steady Saver: default when nothing else triggers
  const top = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'Steady Saver'
  return PERSONALITIES[top]
}
