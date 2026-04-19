'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { User, Key, Save, FileDown, FileUp, Trash2, AlertTriangle, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useLinksStore } from '@/lib/links-store'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { exportLinks, importLinks, clearAll } = useLinksStore()
  const [currentUsername, setCurrentUsername] = useState(session?.user?.name || 'admin')
  const [newUsername, setNewUsername] = useState('')
  const [usernameSaved, setUsernameSaved] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [showClearLinks, setShowClearLinks] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) { toast.error('اسم المستخدم لا يمكن أن يكون فارغاً'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/change-credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newUsername: newUsername.trim() }) })
      const data = await res.json()
      if (res.ok) { setCurrentUsername(newUsername.trim()); setUsernameSaved(true); toast.success('تم تحديث اسم المستخدم'); setTimeout(() => setUsernameSaved(false), 2000) }
      else { toast.error(data.error || 'فشل') }
    } catch { toast.error('خطأ في الاتصال') }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!currentPass) { toast.error('أدخل كلمة المرور الحالية'); return }
    if (!newPass || newPass.length < 4) { toast.error('كلمة المرور يجب أن تكون 4 أحرف على الأقل'); return }
    if (newPass !== confirmPass) { toast.error('كلمة المرور غير متطابقة'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/change-credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }) })
      const data = await res.json()
      if (res.ok) { setPasswordSaved(true); toast.success('تم تغيير كلمة المرور'); setCurrentPass(''); setNewPass(''); setConfirmPass(''); setTimeout(() => setPasswordSaved(false), 2000) }
      else { toast.error(data.error || 'فشل') }
    } catch { toast.error('خطأ في الاتصال') }
    setSaving(false)
  }

  const handleExport = () => { const all = exportLinks(); const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `cinemaplus-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); toast.success(`Exported ${all.length} links`) }
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { try { const items = JSON.parse(ev.target?.result as string); const c = importLinks(items); toast.success(`Imported ${c} links`) } catch { toast.error('Invalid file') } }; r.readAsText(f); e.target.value = '' }

  return (
    <>
      <div className="space-y-6 max-w-2xl">
        <div><h1 className="text-2xl font-bold text-white">الإعدادات</h1><p className="text-sm text-slate-500 mt-1">إدارة حسابك وبيانات المنصة</p></div>

        <div className="bg-[#141820] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><User className="w-4 h-4 text-emerald-400" /></div>
            <div><h2 className="text-base font-semibold text-white">إعدادات الحساب</h2><p className="text-xs text-slate-500">المستخدم: {currentUsername}</p></div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm">اسم المستخدم الجديد</Label>
              <div className="flex gap-3">
                <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="اسم المستخدم الجديد" className="bg-[#0c0f14] border-white/[0.08] text-white h-10 flex-1" />
                <Button onClick={handleSaveUsername} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 gap-2">{usernameSaved ? <><Check className="w-4 h-4" />تم</> : <><Save className="w-4 h-4" />حفظ</>}</Button>
              </div>
            </div>
            <Separator className="bg-white/[0.04]" />
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm flex items-center gap-2"><Key className="w-4 h-4 text-slate-500" />تغيير كلمة المرور</Label>
              <div className="space-y-3">
                <Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="كلمة المرور الحالية" className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 h-10" />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="الجديدة" className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 h-10" />
                  <Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="تأكيد" className="bg-[#0c0f14] border-white/[0.08] text-white placeholder:text-slate-600 h-10" />
                </div>
                <Button onClick={handleChangePassword} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 gap-2">{passwordSaved ? <><Check className="w-4 h-4" />تم التحديث</> : <><Key className="w-4 h-4" />تحديث</>}</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#141820] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Shield className="w-4 h-4 text-emerald-400" /></div>
            <h2 className="text-base font-semibold text-white">إدارة البيانات</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExport} variant="outline" className="border-white/[0.08] text-slate-300 hover:bg-white/5 gap-2 rounded-xl h-10 flex-1"><FileDown className="w-4 h-4" />تصدير الكل</Button>
              <label className="cursor-pointer flex-1"><input type="file" accept=".json" onChange={handleImport} className="hidden" /><Button variant="outline" className="border-white/[0.08] text-slate-300 hover:bg-white/5 gap-2 rounded-xl h-10 w-full" asChild><span><FileUp className="w-4 h-4" />استيراد</span></Button></label>
            </div>
            <Separator className="bg-white/[0.04]" />
            <div className="space-y-3">
              <Label className="text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />منطقة الخطر</Label>
              <Button onClick={() => setShowClearLinks(true)} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2 rounded-xl h-10 w-full"><Trash2 className="w-4 h-4" />مسح جميع الروابط</Button>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={showClearLinks} onOpenChange={setShowClearLinks}>
        <AlertDialogContent className="bg-[#141820] border-white/[0.06] text-white" dir="rtl">
          <AlertDialogHeader><AlertDialogTitle>مسح جميع الروابط</AlertDialogTitle><AlertDialogDescription className="text-slate-400">سيتم حذف الكل نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="border-white/[0.08] text-slate-400">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => { clearAll(); setShowClearLinks(false); toast.success('تم المسح') }} className="bg-red-600 hover:bg-red-700 text-white">مسح</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
