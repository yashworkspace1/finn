'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/common/Sidebar'
import { Navbar } from '@/components/common/Navbar'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-4 font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            FINN
          </span>
        </div>

        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Scrollable Content with page transitions */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="p-4 md:p-8 mx-auto max-w-6xl w-full"
            >
              <Breadcrumb />
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
