'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Film,
  Server,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Power,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/hooks/use-toast'

interface SiteSettings {
  id: string
  siteName: string
  siteDescription: string
  logoUrl: string
  heroAutoPlay: boolean
  heroInterval: number
}

interface ContentItem {
  id: string
  tmdbId: number
  mediaType: string
  title: string
  arabicTitle: string
  quality: string
  tags: string
  featured: boolean
  order: number
}

interface ServerItem {
  id: string
  name: string
  url: string
  isActive: boolean
  order: number
}

interface MessageItem {
  id: string
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: string
}

export function AdminPanel() {
  const { isAdminOpen, setAdminOpen } = useAppStore()
  const { toast } = useToast()

  const [settings, setSettings] = useState<SiteSettings>({
    id: 'main',
    siteName: 'سينما بلس',
    siteDescription: 'مشاهدة وتحميل أفلام ومسلسلات',
    logoUrl: '',
    heroAutoPlay: true,
    heroInterval: 7,
  })
  const [content, setContent] = useState<ContentItem[]>([])
  const [servers, setServers] = useState<ServerItem[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch data on open
  useEffect(() => {
    if (!isAdminOpen) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const [settingsRes, contentRes, serversRes, messagesRes] = await Promise.all([
          fetch('/api/admin?type=settings'),
          fetch('/api/admin?type=content'),
          fetch('/api/admin?type=servers'),
          fetch('/api/admin?type=messages'),
        ])
        const [settingsData, contentData, serversData, messagesData] = await Promise.all([
          settingsRes.json(),
          contentRes.json(),
          serversRes.json(),
          messagesRes.json(),
        ])
        if (settingsData) setSettings(settingsData)
        if (Array.isArray(contentData)) setContent(contentData)
        if (Array.isArray(serversData)) setServers(serversData)
        if (Array.isArray(messagesData)) setMessages(messagesData)
      } catch {
        // Use defaults
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAdminOpen])

  const saveSettings = async () => {
    try {
      const res = await fetch('/api/admin?type=settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) toast({ title: 'تم حفظ الإعدادات بنجاح' })
    } catch {
      toast({ title: 'حدث خطأ أثناء الحفظ', variant: 'destructive' })
    }
  }

  const addServer = async () => {
    try {
      const res = await fetch('/api/admin?type=server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `سيرفر ${servers.length + 1}`, url: '#', isActive: true, order: servers.length }),
      })
      if (res.ok) {
        const newServer = await res.json()
        setServers([...servers, newServer])
        toast({ title: 'تم إضافة السيرفر' })
      }
    } catch {
      toast({ title: 'حدث خطأ', variant: 'destructive' })
    }
  }

  const toggleServer = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin?type=server&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servers.find((s) => s.id === id)),
      })
      if (res.ok) {
        setServers(servers.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s)))
      }
    } catch {
      toast({ title: 'حدث خطأ', variant: 'destructive' })
    }
  }

  const deleteServer = async (id: string) => {
    try {
      const res = await fetch(`/api/admin?type=server&id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setServers(servers.filter((s) => s.id !== id))
        toast({ title: 'تم حذف السيرفر' })
      }
    } catch {
      toast({ title: 'حدث خطأ', variant: 'destructive' })
    }
  }

  const markMessageRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin?type=message&id=${id}`, { method: 'PUT' })
      if (res.ok) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)))
      }
    } catch {
      // ignore
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin?type=message&id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id))
        toast({ title: 'تم حذف الرسالة' })
      }
    } catch {
      toast({ title: 'حدث خطأ', variant: 'destructive' })
    }
  }

  return (
    <Sheet open={isAdminOpen} onOpenChange={setAdminOpen}>
      <SheetContent side="left" className="bg-[#0d0d18] border-white/10 w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <Settings className="size-5 text-streaming-accent" />
            لوحة التحكم
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="settings" className="mt-6" dir="rtl">
          <TabsList className="w-full bg-white/5 mb-6">
            <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-streaming-accent data-[state=active]:text-white text-gray-400">
              <Settings className="size-3.5 ml-1" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="content" className="flex-1 data-[state=active]:bg-streaming-accent data-[state=active]:text-white text-gray-400">
              <Film className="size-3.5 ml-1" />
              المحتوى
            </TabsTrigger>
            <TabsTrigger value="servers" className="flex-1 data-[state=active]:bg-streaming-accent data-[state=active]:text-white text-gray-400">
              <Server className="size-3.5 ml-1" />
              السيرفرات
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 data-[state=active]:bg-streaming-accent data-[state=active]:text-white text-gray-400">
              <MessageSquare className="size-3.5 ml-1" />
              الرسائل
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">اسم الموقع</Label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">وصف الموقع</Label>
                <Textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">رابط الشعار</Label>
                <Input
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 text-sm">تشغيل تلقائي للعرض</Label>
                <Switch
                  checked={settings.heroAutoPlay}
                  onCheckedChange={(v) => setSettings({ ...settings, heroAutoPlay: v })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">فترة التبديل (ثواني)</Label>
                <Input
                  type="number"
                  value={settings.heroInterval}
                  onChange={(e) => setSettings({ ...settings, heroInterval: parseInt(e.target.value) || 7 })}
                  className="bg-white/5 border-white/10 text-white w-32"
                  min={3}
                  max={20}
                />
              </div>
              <Button
                onClick={saveSettings}
                className="bg-streaming-accent hover:bg-streaming-accent/90 text-white w-full gap-2"
              >
                <Save className="size-4" />
                حفظ الإعدادات
              </Button>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            {content.length === 0 ? (
              <div className="text-center py-10">
                <Film className="size-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">لا يوجد محتوى مخصص</p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-gray-400 text-xs">العنوان</TableHead>
                      <TableHead className="text-gray-400 text-xs">النوع</TableHead>
                      <TableHead className="text-gray-400 text-xs">الجودة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {content.map((item) => (
                      <TableRow key={item.id} className="border-white/5 hover:bg-white/[0.03]">
                        <TableCell className="text-white text-sm">{item.arabicTitle}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-white/10 text-gray-300 text-xs">
                            {item.mediaType === 'tv' ? 'مسلسل' : 'فيلم'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 text-xs">{item.quality}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Servers Tab */}
          <TabsContent value="servers" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">سيرفرات البث</h3>
              <Button size="sm" onClick={addServer} className="bg-streaming-accent hover:bg-streaming-accent/90 text-white gap-1.5 text-xs">
                <Plus className="size-3.5" />
                إضافة سيرفر
              </Button>
            </div>

            {servers.length === 0 ? (
              <div className="text-center py-10">
                <Server className="size-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">لا توجد سيرفرات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      server.isActive ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Power className={`size-4 ${server.isActive ? 'text-green-500' : 'text-gray-500'}`} />
                      <div>
                        <p className="text-sm text-white font-medium">{server.name}</p>
                        <p className="text-xs text-gray-500">{server.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={server.isActive} onCheckedChange={() => toggleServer(server.id, server.isActive)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400" onClick={() => deleteServer(server.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="size-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">لا توجد رسائل</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg border transition-all ${
                      msg.isRead ? 'bg-white/[0.02] border-white/5' : 'bg-white/5 border-streaming-accent/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-white font-medium truncate">{msg.name}</p>
                          {!msg.isRead && (
                            <Badge className="bg-streaming-accent/20 text-streaming-accent text-[9px] border-0">
                              جديدة
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{msg.email}</p>
                        <p className="text-sm text-gray-300 line-clamp-3">{msg.message}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {!msg.isRead && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => markMessageRead(msg.id)}>
                            <Eye className="size-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => deleteMessage(msg.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
