'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clapperboard, LayoutDashboard, Globe, Link2, Settings, LogOut, Menu, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const navItems = [
  { label: 'نظرة عامة', href: '/dashboard', icon: LayoutDashboard },
  { label: 'تشغيل السكريبر', href: '/dashboard/scraper', icon: Globe },
  { label: 'إدارة الروابط', href: '/dashboard/links', icon: Link2 },
  { label: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
    toast.success('تم تسجيل الخروج')
  }

  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  const username = session?.user?.name || 'admin'

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onNavigate}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Clapperboard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">سينما <span className="text-emerald-400">بلس</span></h1>
            <p className="text-[10px] text-slate-600">لوحة التحكم</p>
          </div>
        </Link>
      </div>
      <Separator className="bg-white/[0.04]" />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}>
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
                {active && <ChevronLeft className="w-4 h-4 mr-auto text-emerald-500" />}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 text-sm font-bold">{username.charAt(0)?.toUpperCase() || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{username}</p>
            <p className="text-[11px] text-slate-600">مدير النظام</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 h-10 rounded-xl">
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}

export function DashboardSidebar() {
  return (
    <>
      <aside className="hidden lg:flex fixed right-0 top-0 bottom-0 w-64 bg-[#0f1318] border-l border-white/[0.04] flex-col z-40">
        <NavContent />
      </aside>
      <div className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-[#0f1318]/95 backdrop-blur-xl border-b border-white/[0.04] px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Clapperboard className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-bold">سينما <span className="text-emerald-400">بلس</span></span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5"><Menu className="w-5 h-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-[#0f1318] border-white/[0.04] p-0"><NavContent /></SheetContent>
        </Sheet>
      </div>
    </>
  )
}
