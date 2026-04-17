'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Play, Download, Pencil, Trash2, Copy, FileDown, FileUp, ChevronRight, ChevronLeft, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useLinksStore, type LinkItem } from '@/lib/links-store'
import { EditLinkDialog } from '@/components/dashboard/EditLinkDialog'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { toast } from 'sonner'

export default function LinksPage() {
  const searchParams = useSearchParams()
  const initialSite = searchParams.get('site') || ''
  const { links, initialized, getFiltered, deleteLink, deleteMany, importLinks, exportLinks, init } = useLinksStore()
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState(initialSite)
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editLink, setEditLink] = useState<LinkItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [data, setData] = useState({ items: [] as LinkItem[], total: 0, pages: 0 })

  useEffect(() => { if (!initialized) init() }, [initialized, init])
  const refreshData = useCallback(() => { setData(getFiltered({ search, site: siteFilter, linkType: typeFilter, sortBy, page, perPage: 20 })) }, [search, siteFilter, typeFilter, sortBy, page, getFiltered, links])
  useEffect(() => { refreshData() }, [refreshData])
  useEffect(() => { setPage(1) }, [search, siteFilter, typeFilter, sortBy])

  const toggleAll = () => { setSelectedIds(selectedIds.size === data.items.length ? new Set() : new Set(data.items.map(l => l.id))) }
  const toggleOne = (id: string) => { const n = new Set(selectedIds); if (n.has(id)) n.delete(id); else n.add(id); setSelectedIds(n) }

  const handleExport = () => { const all = exportLinks(); const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `cinemaplus-links-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); toast.success(`Exported ${all.length} links`) }
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { try { const items = JSON.parse(ev.target?.result as string); const count = importLinks(items); toast.success(`Imported ${count} links`) } catch { toast.error('Invalid file') } }; reader.readAsText(file); e.target.value = '' }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">إدارة الروابط</h1><p className="text-sm text-slate-500 mt-1">{data.total} رابط {selectedIds.size > 0 && `| ${selectedIds.size} محدد`}</p></div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="border-white/[0.08] text-slate-300 hover:bg-white/5 gap-2 rounded-xl h-9 text-sm"><FileDown className="w-4 h-4" />تصدير</Button>
          <label className="cursor-pointer"><input type="file" accept=".json" onChange={handleImport} className="hidden" /><Button variant="outline" className="border-white/[0.08] text-slate-300 hover:bg-white/5 gap-2 rounded-xl h-9 text-sm" asChild><span><FileUp className="w-4 h-4" />استيراد</span></Button></label>
        </div>
      </div>

      <div className="bg-[#141820] rounded-2xl border border-white/[0.06] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالعنوان..." className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 h-9 pr-10 rounded-lg" />
          </div>
          <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="h-9 rounded-lg bg-[#0c0f14] border border-white/[0.08] text-white text-sm px-3 focus:outline-none focus:border-emerald-500/50 min-w-[130px]">
            <option value="">كل المواقع</option><option value="dramacafe">دراما كافيه</option><option value="wecima">ويما</option><option value="cimanow">سيما ناو</option><option value="arabseed">عرب سيد</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-lg bg-[#0c0f14] border border-white/[0.08] text-white text-sm px-3 focus:outline-none focus:border-emerald-500/50 min-w-[120px]">
            <option value="">كل الأنواع</option><option value="watch">مشاهدة</option><option value="download">تحميل</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 rounded-lg bg-[#0c0f14] border border-white/[0.08] text-white text-sm px-3 focus:outline-none focus:border-emerald-500/50 min-w-[120px]">
            <option value="newest">الأحدث</option><option value="oldest">الأقدم</option><option value="title">العنوان</option>
          </select>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.04]">
            <span className="text-xs text-slate-400">{selectedIds.size} محدد</span>
            <Button variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10 gap-1.5 rounded-lg h-8 text-xs" onClick={() => setShowBulkDelete(true)}><Trash2 className="w-3.5 h-3.5" />حذف المحدد</Button>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-300 gap-1.5 h-8 text-xs" onClick={() => setSelectedIds(new Set())}>إلغاء</Button>
          </div>
        )}
      </div>

      <div className="bg-[#141820] rounded-2xl border border-white/[0.06] overflow-hidden">
        {data.items.length === 0 ? (
          <EmptyState title="لا توجد روابط" description={search || siteFilter || typeFilter ? 'جرب تغيير الفلاتر' : 'ابدأ بتشغيل السكريبر'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-slate-500 text-xs border-b border-white/[0.04]">
                <th className="px-4 py-3 w-10"><button onClick={toggleAll} className="text-slate-500 hover:text-white">{selectedIds.size === data.items.length && data.items.length > 0 ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}</button></th>
                <th className="text-right px-4 py-3">العنوان</th><th className="text-right px-4 py-3">الموقع</th><th className="text-right px-4 py-3">النوع</th><th className="text-right px-4 py-3">الجودة</th><th className="text-right px-4 py-3">التاريخ</th><th className="text-right px-4 py-3">إجراءات</th>
              </tr></thead>
              <tbody>{data.items.map((link) => (
                <tr key={link.id} className={`border-t border-white/[0.03] hover:bg-white/[0.02] ${selectedIds.has(link.id) ? 'bg-emerald-500/[0.03]' : ''}`}>
                  <td className="px-4 py-3"><button onClick={() => toggleOne(link.id)}>{selectedIds.has(link.id) ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-600" />}</button></td>
                  <td className="px-4 py-3"><p className="text-white font-medium max-w-[200px] truncate">{link.title}</p>{link.episodeInfo && <p className="text-[11px] text-slate-600">{link.episodeInfo}</p>}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="border-white/[0.08] text-slate-400 text-[11px]">{link.siteName}</Badge></td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 text-xs ${link.linkType === 'watch' ? 'text-emerald-400' : 'text-blue-400'}`}>{link.linkType === 'watch' ? <><Play className="w-3 h-3" />مشاهدة</> : <><Download className="w-3 h-3" />تحميل</>}</span></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{link.quality || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs" dir="ltr">{new Date(link.addedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { navigator.clipboard.writeText(link.url); toast.success('Copied') }} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05]"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setEditLink(link); setEditOpen(true) }} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05]"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(link.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
            <span className="text-xs text-slate-600">صفحة {page} من {data.pages}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="h-8 w-8 text-slate-400"><ChevronRight className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setPage(Math.min(data.pages, page + 1))} disabled={page === data.pages} className="h-8 w-8 text-slate-400"><ChevronLeft className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>

      <EditLinkDialog link={editLink} open={editOpen} onOpenChange={setEditOpen} />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#141820] border-white/[0.06] text-white" dir="rtl">
          <AlertDialogHeader><AlertDialogTitle>حذف الرابط</AlertDialogTitle><AlertDialogDescription className="text-slate-400">هل أنت متأكد؟ لا يمكن التراجع.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="border-white/[0.08] text-slate-400">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteId) { deleteLink(deleteId); toast.success('تم الحذف'); setDeleteId(null) } }} className="bg-red-600 hover:bg-red-700 text-white">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent className="bg-[#141820] border-white/[0.06] text-white" dir="rtl">
          <AlertDialogHeader><AlertDialogTitle>حذف المحددة</AlertDialogTitle><AlertDialogDescription className="text-slate-400">حذف {selectedIds.size} رابط نهائياً؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="border-white/[0.08] text-slate-400">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMany(Array.from(selectedIds)); toast.success(`تم حذف ${selectedIds.size} رابط`); setSelectedIds(new Set()); setShowBulkDelete(false) }} className="bg-red-600 hover:bg-red-700 text-white">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
