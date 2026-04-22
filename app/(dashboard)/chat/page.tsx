'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, MessageCircle, Sparkles, Zap, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  message: string
  createdAt: Date
}

const SUGGESTED = [
  "What's my biggest expense category? 💸",
  "How much did I save this month? 🏦",
  "Show me my recurring subscriptions 🔄",
  "Is my cash flow improving? 📈",
  "Analyze my spending personality 🧠",
]

export default function FinChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/chat')
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      } catch {
        // silent
      } finally {
        setLoadingHistory(false)
      }
    }
    loadHistory()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text?: string) {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      message: messageText,
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      })

      if (!res.ok) throw new Error('Chat failed')
      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        message: data.response || "I'm having trouble right now. Try again!",
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      toast.error('FINN is thinking — try again in a moment.')
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }

  async function clearChat() {
    try {
      const res = await fetch('/api/chat', { method: 'DELETE' })
      if (res.ok) {
        setMessages([])
        toast.success('Chat history cleared')
      }
    } catch {
      toast.error('Failed to clear chat')
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] relative">
      
      {/* ── HEADER ── */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
          }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              FinChat Copilot
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>FINN AI Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          style={{ 
            padding: '8px', borderRadius: '10px', background: 'var(--bg-elevated)', 
            border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--text-muted)' 
          }}
        >
          <Trash size={16} />
        </button>
      </div>

      {/* ── MESSAGES AREA ── */}
      <div style={{ 
        flex: 1, overflowY: 'auto', padding: '30px 24px', 
        display: 'flex', flexDirection: 'column', gap: '24px',
        background: 'var(--bg-surface)'
      }}>
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="animate-spin text-accent-primary" size={24} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Synchronizing intelligence...</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ 
                width: '80px', height: '80px', borderRadius: '24px', 
                background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <MessageCircle size={32} style={{ color: 'var(--accent-primary)' }} />
            </motion.div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>I&apos;m FINN.</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '320px', marginBottom: '40px' }}>
              Your private financial advisor. I can analyze your transactions, predict taxes, and find leaks.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', width: '100%', maxWidth: '400px' }}>
              {SUGGESTED.map((q, i) => (
                <button 
                  key={i} onClick={() => handleSend(q)}
                  style={{ 
                    padding: '14px 20px', borderRadius: '14px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'var(--bg-surface)' }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: '12px', alignItems: 'flex-start'
                }}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '10px', 
                  background: msg.role === 'user' ? 'var(--bg-elevated)' : 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, color: '#ffffff', flexShrink: 0
                }}>
                  {msg.role === 'user' ? 'U' : 'F'}
                </div>
                <div style={{ 
                  maxWidth: '75%', padding: '16px 20px', borderRadius: '20px',
                  background: msg.role === 'user' ? 'var(--bg-elevated)' : 'var(--bg-overlay)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6,
                  borderTopRightRadius: msg.role === 'user' ? '4px' : '20px',
                  borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '20px',
                  boxShadow: msg.role === 'assistant' ? '0 10px 30px rgba(124, 58, 237, 0.05)' : 'none'
                }}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.message}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.message}</p>
                  )}
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 700 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>F</div>
            <div style={{ padding: '12px 20px', borderRadius: '20px', borderTopLeftRadius: '4px', background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%' }} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT AREA ── */}
      <div style={{ 
        padding: '24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)',
        borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px'
      }}>
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <input 
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask FINN anything about your money..."
            disabled={loading}
            style={{ 
              width: '100%', padding: '16px 60px 16px 20px', borderRadius: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', fontSize: '15px', outline: 'none', transition: 'all 0.2s'
            }}
          />
          <button 
            onClick={() => handleSend()} disabled={loading || !input.trim()}
            style={{ 
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
              border: 'none', cursor: 'pointer', opacity: (loading || !input.trim()) ? 0.5 : 1
            }}
          >
            <Send size={18} />
          </button>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', fontWeight: 600 }}>
          FINN may provide estimates. Always cross-check with actual bank records.
        </p>
      </div>

    </div>
  )
}

const RefreshCw = ({ className, size }: { className?: string, size?: number }) => (
  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
    <Zap size={size} className={className} />
  </motion.div>
)
