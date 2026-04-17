'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useLinksStore, SITE_NAMES, type LinkItem } from '@/lib/links-store'
import { toast } from 'sonner'

export function ManualAddDialog({ children, defaultSite }: { children: React.ReactNode; defaultSite?: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [site, setSite] = useState(defaultSite || 'dramacafe')
  const [linkType, setLinkType] = useState<'watch' | 'download'>('watch')
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('1080p')
  const [episodeInfo, setEpisodeInfo] = useState('')
  const { addLink } = useLinksStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) { toast.error('أدخل العنوان والرابط'); return }
    addLink({ title: title.trim(), site: site as LinkItem['site'], siteName: SITE_NAMES[site] || site, linkType, url: url.trim(), quality, source: 'manual', episodeInfo: episodeInfo.trim() || undefined })
    toast.success('تم إضافة الرابط')
    setTitle(''); setUrl(''); setEpisodeInfo(''); setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-[#141820] border-white/[0.06] text-white max-w-lg" dir="rtl">
        <DialogHeader><DialogTitle>إضافة رابط يدوياً</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">عنوان العمل *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Spider-Man: No Way Home" className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 h-10" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">الموقع</Label>
              <select value={site} onChange={(e) => setSite(e.target.value)} className="w-full h-10 rounded-lg bg-[#0c0f14] border border-white/[0.08] text-white text-sm px-3 focus:outline-none focus:border-emerald-500/50">
                {Object.entries(SITE_NAMES).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">النوع</Label>
              <select value={linkType} onChange={(e) => setLinkType(e.target.value as 'watch' | 'download')} className="w-full h-10 rounded-lg bg-[#0c0f14] border border-white/[0.08] text-white text-sm px-3 focus:outline-none focus:border-emerald-500/50">
                <option value="watch">مشاهدة</option><option value="download">تحميل</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">الرابط *</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/watch/movie" className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 h-10" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">الجودة</Label>
              <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full h-10 rounded-lg bg-[#0c0f14] border border-white/[0.08] text-white text-sm px-3 focus:outline-none focus:border-emerald-500/50">
                <option value="1080p">1080p</option><option value="720p">720p</option><option value="480p">480p</option><option value="4K">4K</option><option value="">غير محدد</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">معلومات الحلقة</Label>
              <Input value={episodeInfo} onChange={(e) => setEpisodeInfo(e.target.value)} placeholder="الموسم 1 الحلقة 5" className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 h-10" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 gap-2"><Plus className="w-4 h-4" />إضافة</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/[0.08] text-slate-400 hover:bg-white/5 rounded-xl h-10">إلغاء</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
