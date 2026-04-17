'use client'

import { useState } from 'react'
import { Coffee, Film, Tv, Sprout, Play, Plus, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLinksStore, SITE_NAMES, type LinkItem } from '@/lib/links-store'
import { ManualAddDialog } from '@/components/dashboard/ManualAddDialog'
import { LiveLog } from '@/components/dashboard/LiveLog'
import { toast } from 'sonner'
import Link from 'next/link'

interface SiteConfig {
  key: string
  nameAr: string
  nameEn: string
  url: string
  icon: React.ElementType
  color: string
}

const sites: SiteConfig[] = [
  { key: 'wecima', nameAr: 'ويما', nameEn: 'Wecima', url: 'wecima.bar', icon: Film, color: 'text-blue-400' },
  { key: 'dramacafe', nameAr: 'دراما كافيه', nameEn: 'DramaCafe', url: 'dramacafe.blog', icon: Coffee, color: 'text-amber-400' },
  { key: 'cimanow', nameAr: 'سيما ناو', nameEn: 'CimaNow', url: 'cimanow.cc', icon: Tv, color: 'text-rose-400' },
  { key: 'arabseed', nameAr: 'عرب سيد', nameEn: 'ArabSeed', url: 'arabseed.life', icon: Sprout, color: 'text-emerald-400' },
]

export default function ScraperPage() {
  const { links, addLinks } = useLinksStore()
  const [expandedSite, setExpandedSite] = useState<string | null>(null)
  const [runningSite, setRunningSite] = useState<string | null>(null)
  const [logs, setLogs] = useState<Record<string, string[]>>({})

  const getSiteLinkCount = (siteKey: string) => links.filter((l) => l.site === siteKey).length

  const runRealScraper = async (site: SiteConfig) => {
    if (runningSite) { toast.error('يوجد سكريبر يعمل بالفعل'); return }
    setRunningSite(site.key)
    setExpandedSite(site.key)
    const siteLogs: string[] = []
    setLogs((prev) => ({ ...prev, [site.key]: [] }))

    const addLog = (msg: string) => { siteLogs.push(msg); setLogs((prev) => ({ ...prev, [site.key]: [...siteLogs] })) }

    addLog(`Starting ${site.nameAr} (${site.nameEn})...`)

    try {
      const response = await fetch('/api/scrape/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: site.key }),
      })
      const result = await response.json()

      if (!response.ok) {
        addLog(`Error: ${result.error || 'Failed'}`)
        toast.error(result.error || 'Failed')
        setRunningSite(null)
        return
      }

      if (result.logs && result.logs.length > 0) {
        result.logs.forEach((log: string) => addLog(log))
      }

      if (result.success && result.items && result.items.length > 0) {
        const newLinks = result.items.map((item: { title: string; url: string; quality: string; site: string; siteName: string; linkType: 'watch' | 'download'; contentType: string; episodeInfo?: string }) => ({
          title: item.title,
          site: item.site as LinkItem['site'],
          siteName: item.siteName,
          linkType: item.linkType,
          url: item.url,
          quality: item.quality,
          source: 'auto' as const,
          episodeInfo: item.episodeInfo,
        }))
        const added = addLinks(newLinks)
        addLog(`Saved ${added} new links`)
        toast.success(`Got ${added} links from ${site.nameAr}`)
      } else if (result.success && result.filtered === 0) {
        addLog(`No new links found (site may be protected)`)
        toast.warning('No new links found')
      } else {
        addLog(`Error: ${result.error || 'Failed'}`)
        toast.error(result.error || 'Failed')
      }
    } catch (error) {
      addLog(`Connection error: ${error instanceof Error ? error.message : 'Unknown'}`)
      toast.error('Server connection error')
    }
    setRunningSite(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">تشغيل السكريبر</h1>
        <p className="text-sm text-slate-500 mt-1">اختر موقعاً لبدء جلب الروابط تلقائياً أو أضفها يدوياً</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sites.map((site) => {
          const Icon = site.icon
          const linkCount = getSiteLinkCount(site.key)
          const isExpanded = expandedSite === site.key
          const isRunning = runningSite === site.key

          return (
            <div key={site.key} className="bg-[#141820] rounded-2xl border border-white/[0.06] overflow-hidden">
              <button onClick={() => setExpandedSite(isExpanded ? null : site.key)} className="w-full p-5 flex items-center gap-4 text-right hover:bg-white/[0.02]">
                <div className={`w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center ${site.color}`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{site.nameAr}</h3>
                    <Badge variant="outline" className="border-white/[0.08] text-slate-500 text-[10px]">{site.nameEn}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5" dir="ltr">{site.url}</p>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-emerald-400" dir="ltr">{linkCount}</div>
                  <p className="text-[10px] text-slate-600">رابط</p>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/[0.04] pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => runRealScraper(site)} disabled={isRunning} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl h-9 text-sm">
                      {isRunning ? <><Loader2 className="w-4 h-4 animate-spin" />جاري الجلب...</> : <><Play className="w-4 h-4" />بدء الجلب</>}
                    </Button>
                    <ManualAddDialog defaultSite={site.key}>
                      <Button variant="outline" className="border-white/[0.08] text-slate-300 hover:bg-white/5 gap-2 rounded-xl h-9 text-sm"><Plus className="w-4 h-4" />إضافة يدوية</Button>
                    </ManualAddDialog>
                    <Link href={`/dashboard/links?site=${site.key}`}>
                      <Button variant="outline" className="border-white/[0.08] text-slate-300 hover:bg-white/5 gap-2 rounded-xl h-9 text-sm"><ExternalLink className="w-4 h-4" />عرض الروابط</Button>
                    </Link>
                  </div>
                  <LiveLog logs={logs[site.key] || []} />
                  {isRunning && <div className="flex items-center gap-2 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />السكريبر يعمل...</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
