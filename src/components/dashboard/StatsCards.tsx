'use client'

import { Link2, Play, Download, Globe } from 'lucide-react'

interface StatsCardsProps {
  stats: { total: number; watch: number; download: number; sites: Record<string, number> }
}

const cards = [
  { key: 'total', label: 'إجمالي الروابط', icon: Link2 },
  { key: 'watch', label: 'روابط المشاهدة', icon: Play },
  { key: 'download', label: 'روابط التحميل', icon: Download },
  { key: 'sites', label: 'المواقع النشطة', icon: Globe },
]

export function StatsCards({ stats }: StatsCardsProps) {
  const getVal = (key: string) => {
    switch (key) {
      case 'total': return stats.total
      case 'watch': return stats.watch
      case 'download': return stats.download
      case 'sites': return Object.values(stats.sites).filter(v => v > 0).length
      default: return 0
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.key} className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-400 mb-1" dir="ltr">{getVal(card.key).toLocaleString()}</div>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
