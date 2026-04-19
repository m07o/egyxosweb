'use client'

import { useSession, signOut } from 'next-auth/react'
import { Clapperboard, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative" dir="rtl">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f1318] to-[#0a0a0f]" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 left-1/3 w-[400px] h-[400px] bg-emerald-600/3 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex justify-between items-center p-4 md:p-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">
              سينما <span className="text-emerald-400">بلس</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm text-slate-400 hidden sm:inline">
                  {(session.user as any)?.isAdmin ? '🔐 أدمن' : '👤'} {session.user?.name}
                </span>
                {(session.user as any)?.isAdmin ? (
                  <Link href="/dashboard">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl h-10 px-4 transition-all">
                      لوحة التحكم
                    </Button>
                  </Link>
                ) : (
                  <Link href="/profile">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl h-10 px-4 transition-all">
                      حسابي
                    </Button>
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 h-10 px-4 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 h-10 px-5 bg-white/[0.1] hover:bg-white/[0.15] text-white text-sm font-medium rounded-xl transition-all">
                  دخول
                </Link>
                <Link href="/signup" className="flex items-center gap-2 h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-900/30">
                  تسجيل جديد
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="text-center space-y-8 max-w-lg mx-auto">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Clapperboard className="w-12 h-12 text-emerald-400" />
              </div>
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                سينما <span className="text-emerald-400">بلس</span>
              </h1>
              <p className="text-xl text-slate-400">منصة إدارة روابط المشاهدة والتحميل</p>
              <p className="text-sm text-slate-600 mt-3">سكرابر ذكي يجلب روابط من أفضل المواقع العربية</p>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-6">
              {[
                { val: '4', label: 'مواقع مدعومة' },
                { val: '∞', label: 'روابط بدون حدود' },
                { val: 'سريع', label: 'جلب تلقائي' },
                { val: 'مجاني', label: 'بالكامل' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-3 text-center">
                  <div className="text-xl font-bold text-emerald-400">{stat.val}</div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>

            {!session && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <Link href="/signup" className="flex-1 sm:flex-initial">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-emerald-900/30">
                    إنشاء حساب جديد
                  </Button>
                </Link>
                <Link href="/login" className="flex-1 sm:flex-initial">
                  <Button variant="outline" className="w-full border-white/[0.08] text-slate-300 hover:bg-white/5 font-medium rounded-xl h-11 transition-all">
                    تسجيل دخول
                  </Button>
                </Link>
              </div>
            )}

            <p className="text-xs text-slate-700">ويما • دراما كافيه • سيما ناو • عرب سيد</p>
          </div>
        </div>
      </div>
    </div>
  )
}
