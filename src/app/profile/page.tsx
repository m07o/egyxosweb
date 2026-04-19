'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login')
    }

    // Redirect to dashboard if admin
    if (session?.user && (session.user as any)?.isAdmin) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-slate-400">جاري التحميل...</p>
      </div>
    )
  }

  if (!session?.user || (session.user as any)?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]" dir="rtl">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f1318] to-[#0a0a0f]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <ArrowRight className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-400 text-sm">العودة للرئيسية</span>
          </Link>

          <h1 className="text-2xl font-bold text-white">حسابي</h1>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 h-10 px-4 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{session.user.name}</h2>
                <p className="text-slate-400 text-sm">{session.user.email}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">معلومات الحساب</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400">اسم المستخدم:</span>
                    <span className="text-white">{session.user.name}</span>
                  </div>
                  <div className="flex justify-between items-start border-t border-white/[0.06] pt-4">
                    <span className="text-slate-400">البريد الإلكتروني:</span>
                    <span className="text-white text-sm">{session.user.email}</span>
                  </div>
                  <div className="flex justify-between items-start border-t border-white/[0.06] pt-4">
                    <span className="text-slate-400">نوع الحساب:</span>
                    <span className="text-emerald-400 font-medium">مستخدم عادي 👤</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">قائمة المتابعة</h3>
                <p className="text-slate-400 text-center py-8">لا توجد عناصر في قائمة المتابعة حالياً</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl h-12 transition-all">
                العودة للصفحة الرئيسية
              </Button>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl h-12 transition-all"
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
