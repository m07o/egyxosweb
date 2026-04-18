'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Clapperboard, Lock, Eye, EyeOff, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('يرجى إدخال اسم المستخدم وكلمة المرور')
      return
    }
    setLoading(true)
    const result = await signIn('credentials', {
      username: username.trim(),
      password: password.trim(),
      redirect: false,
    })
    if (result?.error) {
      toast.error('اسم المستخدم أو كلمة المرور غير صحيحة')
    } else {
      toast.success('مرحباً بك!')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

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

          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-900/30"
          >
            <Lock className="w-4 h-4" />
            دخول
          </button>
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-900/30"
              >
                <Lock className="w-5 h-5" />
                ادخل لوحة التحكم
              </button>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 h-12 px-8 border border-white/[0.08] text-slate-300 hover:bg-white/5 rounded-xl transition-all">
                صفحة تسجيل الدخول
              </Link>
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

            <p className="text-xs text-slate-700">ويما • دراما كافيه • سيما ناو • عرب سيد</p>
          </div>
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
          <div className="relative w-full max-w-sm bg-[#141820] rounded-2xl border border-white/[0.06] p-6 shadow-2xl shadow-black/50">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">تسجيل الدخول</h2>
              <p className="text-xs text-slate-500 mt-1">أدخل بيانات حسابك</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم"
                  className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-emerald-500/50 h-11"
                  autoFocus
                />
              </div>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-emerald-500/50 h-11 pl-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري التحقق...
                  </span>
                ) : 'دخول'}
              </Button>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
