import Link from 'next/link'
import { FileQuestion, Home, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-[var(--accent-primary)] opacity-[0.03] rounded-full blur-[120px]" />
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-[var(--expense-color)] opacity-[0.03] rounded-full blur-[120px]" />

      <div className="finn-card relative z-10" style={{ padding: '60px 40px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '24px', 
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px auto', color: 'var(--text-muted)'
        }}>
          <FileQuestion size={40} />
        </div>
        
        <h1 style={{ fontSize: '100px', fontWeight: 900, color: 'var(--accent-primary)', opacity: 0.2, lineHeight: 0.8, marginBottom: '24px', letterSpacing: '-5px' }}>
          404
        </h1>
        
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px' }}>
          System Not Found
        </h2>
        
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6 }}>
          The financial sector you are looking for does not exist in our database. It may have been moved or deleted.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/dashboard">
            <button style={{ 
              padding: '12px 24px', borderRadius: '12px', 
              background: 'var(--accent-primary)', color: '#ffffff',
              fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)'
            }}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
          </Link>
          <Link href="/">
            <button style={{ 
              padding: '12px 24px', borderRadius: '12px', 
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <Home size={16} /> Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
