'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clapperboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type AccountType = 'user' | 'admin'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<AccountType>('user')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
    adminPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.passwordConfirm) {
      toast.error('كلمات المرور غير متطابقة')
      return
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    try {
      if (accountType === 'user') {
        // User registration
        if (!formData.email) {
          toast.error('البريد الإلكتروني مطلوب')
          return
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'حدث خطأ في التسجيل')
          return
        }

        toast.success('تم التسجيل بنجاح! الرجاء تسجيل الدخول')
      } else {
        // Admin registration
        if (!formData.username) {
          toast.error('اسم المستخدم مطلوب')
          return
        }

        if (!formData.adminPassword) {
          toast.error('كلمة مرور الأدمن الرئيسية مطلوبة')
          return
        }

        const res = await fetch('/api/auth/admin-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            adminPassword: formData.adminPassword,
            email: formData.email || undefined,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'حدث خطأ في التسجيل')
          return
        }

        toast.success('تم تسجيل الأدمن بنجاح! الرجاء تسجيل الدخول')
      }

      router.push('/login')
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
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
            لديك حساب؟ دخول
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
          <div className="w-full max-w-md">
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white">إنشاء حساب جديد</h1>
                <p className="text-slate-400 text-sm">انضم إلى سينما بلس واستمتع بالمحتوى</p>
              </div>

              {/* Account Type Toggle */}
              <div className="flex gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAccountType('user')
                    setFormData(prev => ({ ...prev, adminPassword: '' }))
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                {accountType === 'user' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        الاسم (اختياري)
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="محمد علي"
                        className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                        className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        اسم المستخدم
                      </label>
                      <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="admin"
                        required
                        className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        البريد الإلكتروني (اختياري)
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@example.com"
                        className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    كلمة المرور
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                  />
                  <p className="text-xs text-slate-500 mt-1">6 أحرف على الأقل</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <Input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                  />
                </div>

                {accountType === 'admin' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                    <label className="block text-sm font-medium text-blue-300 mb-2">
                      كلمة مرور الأدمن الرئيسية
                    </label>
                    <Input
                      type="password"
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl h-10"
                    />
                    <p className="text-xs text-blue-300/70 mt-1">كلمة الأدمن المميزة</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl h-10 transition-all"
                >
                  {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-white/[0.08]">
                <p className="text-slate-500 text-sm">لديك حساب بالفعل؟</p>
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                  تسجيل دخول
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

