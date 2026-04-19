'use client'

import { useSession } from 'next-auth/react'
import { DashboardSidebar } from '@/components/dashboard/Sidebar'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0c0f14] flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500">جاري التحقق...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0f14]" dir="rtl">
      <DashboardSidebar />
      <main className="lg:mr-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
