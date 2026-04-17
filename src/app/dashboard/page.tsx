'use client'

import { useEffect, useState } from 'react'
import { Link as NextLink } from 'next/link'
import { Link2, Play, Download, Globe, Plus, ArrowLeft } from 'lucide-react'
import { useLinksStore } from '@/lib/links-store'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DashboardOverview() {
  const { links, initialized, getStats, init } = useLinksStore()
  const [stats, setStats] = useState({ total: 0, watch: 0, download: 0, sites: {} as Record<string, number> })
  const recentLinks = links.slice(0, 10)

  useEffect(() => { if (!initialized) init() }, [initialized, init])
  useEffect(() => { setStats(getStats()) }, [links, getStats])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">نظرة عامة</h1>
          <p className="text-sm text-slate-500 mt-1">ملخص سريع لحالة المنصة</p>
        </div>
        <div className="flex gap-3">
          <NextLink href="/dashboard/scraper"><Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl h-10"><Globe className="w-4 h-4" />تشغيل السكريبر</Button></NextLink>
          <NextLink href="/dashboard/links"><Button variant="outline" className="border-white/[0.08] text-slate-300 hover:bg-white/5 gap-2 rounded-xl h-10"><Plus className="w-4 h-4" />إدارة الروابط</Button></NextLink>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="bg-[#141820] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
          <h2 className="text-base font-semibold text-white">آخر الروابط المضافة</h2>
          <NextLink href="/dashboard/links"><Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 gap-1.5 text-xs">عرض الكل<ArrowLeft className="w-3.5 h-3.5" /></Button></NextLink>
        </div>
        {recentLinks.length === 0 ? (
          <div className="text-center py-16">
            <Link2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">لا توجد روابط بعد</p>
            <p className="text-slate-600 text-xs mt-1">ابدأ بتشغيل السكريبر أو أضف روابط يدوياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="text-right px-6 py-3 font-medium">العنوان</th>
                  <th className="text-right px-4 py-3 font-medium">الموقع</th>
                  <th className="text-right px-4 py-3 font-medium">النوع</th>
                  <th className="text-right px-4 py-3 font-medium">الجودة</th>
                  <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentLinks.map((link) => (
                  <tr key={link.id} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-white font-medium max-w-[200px] truncate">
                      {link.title}
                      {link.episodeInfo && <span className="text-xs text-slate-500 block">{link.episodeInfo}</span>}
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="border-white/[0.08] text-slate-400 text-[11px]">{link.siteName}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${link.linkType === 'watch' ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {link.linkType === 'watch' ? <Play className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                        {link.linkType === 'watch' ? 'مشاهدة' : 'تحميل'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{link.quality || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs" dir="ltr">{new Date(link.addedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
