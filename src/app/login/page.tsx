'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Clapperboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type AccountType = 'user' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<AccountType>('user')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!identifier || !password) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }

    setLoading(true)
    try {
      let result

      if (accountType === 'admin') {
        // Admin login
        result = await signIn('admin-credentials', {
          username: identifier,
          password,
          redirect: false,
        })
      } else {
        // User login
        result = await signIn('user-credentials', {
          email: identifier,
          password,
          redirect: false,
        })
      }

      if (result?.error) {
        toast.error(result.error || 'خطأ في تسجيل الدخول')
        return
      }

      if (result?.ok) {
        toast.success('تم تسجيل الدخول بنجاح!')
        router.push(accountType === 'admin' ? '/dashboard' : '/profile')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative" dir="rtl">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f1318] to-[#0a0a0f]" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 left-1/3 w-[400px] h-[400px] bg-emerald-600/3 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">
              سينما <span className="text-emerald-400">بلس</span>
            </span>
          </Link>
          <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
            حساب جديد
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
          <div className="w-full max-w-md">
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white">تسجيل الدخول</h1>
                <p className="text-slate-400 text-sm">استمتع بمحتواك</p>
              </div>

              {/* Account Type Tabs */}
              <div className="flex gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setAccountType('user')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    accountType === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  مستخدم عادي
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('admin')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    accountType === 'admin'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  أدمن
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {accountType === 'admin' ? 'اسم المستخدم' : 'البريد الإلكتروني'}
                  </label>
                  <Input
                    type={accountType === 'admin' ? 'text' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={accountType === 'admin' ? 'admin' : 'email@example.com'}
                    required
                    className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    كلمة المرور
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl h-10 transition-all"
                >
                  {loading ? 'جاري تسجيل الدخول...' : 'تسجيل دخول'}
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-white/[0.08]">
                <p className="text-slate-500 text-sm">ليس لديك حساب؟</p>
                <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
