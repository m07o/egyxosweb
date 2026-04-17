'use client'

import { Link2 } from 'lucide-react'

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
        <Link2 className="w-7 h-7 text-slate-700" />
      </div>
      <p className="text-slate-400 font-medium">{title}</p>
      {description && <p className="text-slate-600 text-sm mt-1.5 max-w-sm mx-auto">{description}</p>}
    </div>
  )
}
