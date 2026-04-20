'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { BackButton } from '@/components/common/BackButton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  message: string
  createdAt: Date
}

const SUGGESTED = [
  "Where did I spend the most this month? 💸",
  "Am I saving enough for my income? 🏦",
  "What subscriptions can I cancel? 🔄",
  "Should I start investing? 📈",
  "How can I improve my financial health? 💪",
  "Explain my spending personality 🧠",
]

export default function FinChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load chat history on mount
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

  // Auto scroll to bottom
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
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" className="" />
          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg relative">
            F
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"/>
          </div>
          <div>
            <p className="font-semibold tracking-tight">FINN</p>
            <p className="text-xs text-muted-foreground">Your AI Financial Advisor</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          className="transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] hover:text-destructive"
        >
          <Trash2 className="w-4 h-4"/>
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 space-y-6"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center"
            >
              <MessageCircle className="w-8 h-8 text-violet-500"/>
            </motion.div>
            <div className="text-center">
              <h3 className="font-semibold text-lg tracking-tight">Hi! I&apos;m FINN 👋</h3>
              <p className="text-muted-foreground text-sm mt-1">Ask me anything about your finances</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="p-3 text-sm text-left bg-card border rounded-xl hover:border-violet-500/60 hover:bg-violet-500/5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">F</div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm'
                    : 'bg-card border rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-strong:text-violet-400 dark:prose-strong:text-violet-300 prose-ul:my-1 prose-li:my-0.5 prose-headings:text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.message}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span>{msg.message}</span>
                )}
                <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-violet-200' : 'text-muted-foreground'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">F</div>
            <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.6 }}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask FINN anything about your finances..."
            disabled={loading}
            className="flex-1 h-11 bg-background focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
            maxLength={500}
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="h-11 w-11 bg-violet-600 hover:bg-violet-700 p-0 shadow-lg transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
          >
            <Send className="w-4 h-4 text-white"/>
          </Button>
        </div>
      </div>
    </div>
  )
}
