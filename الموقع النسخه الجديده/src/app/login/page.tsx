'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Clapperboard, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) { toast.error('يرجى ملء جميع الحقول'); return }
    setLoading(true)
    const result = await signIn('credentials', { username: username.trim(), password: password.trim(), redirect: false })
    if (result?.error) {
      toast.error('اسم المستخدم أو كلمة المرور غير صحيحة')
    } else {
      toast.success('مرحباً بك!')
      router.push(callbackUrl)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f1318] to-[#0a0a0f]" />
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-emerald-600/3 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Clapperboard className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-white">سينما <span className="text-emerald-400">بلس</span></h1>
              <p className="text-xs text-slate-500">لوحة التحكم</p>
            </div>
          </Link>
        </div>

        <div className="bg-[#141820] rounded-2xl border border-white/[0.06] p-8 shadow-2xl shadow-black/40">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">تسجيل الدخول</h2>
            <p className="text-sm text-slate-500 mt-1">أدخل بيانات حسابك للوصول للوحة التحكم</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300 text-sm">اسم المستخدم</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-emerald-500/50 h-11" autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm">كلمة المرور</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-emerald-500/50 h-11 pl-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />جاري التحقق...</span> : 'تسجيل الدخول'}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-[#141820] rounded-xl border border-white/[0.06] p-4">
            <p className="text-xs text-slate-500 mb-2">بيانات الدخول:</p>
            <p className="text-sm text-slate-400">المستخدم: <span className="text-emerald-400 font-mono" dir="ltr">admin</span></p>
            <p className="text-sm text-slate-400">كلمة المرور: <span className="text-emerald-400 font-mono" dir="ltr">admin123</span></p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-sm">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center" dir="rtl"><div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
