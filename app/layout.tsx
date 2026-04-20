import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/context/AuthContext'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FINN — Your Personal CFO',
  description:
    'FINN is an AI-powered financial intelligence platform that auto-categorizes transactions, predicts cash flow, and gives you personalized financial insights.',
  keywords: ['finance', 'AI', 'budgeting', 'cash flow', 'financial analytics'],
  openGraph: {
    title: 'FINN — Your Personal CFO',
    description: 'AI-powered financial intelligence. Upload your bank statement and get instant insights.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Toaster
                richColors
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    padding: '10px 14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                }}
              />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
