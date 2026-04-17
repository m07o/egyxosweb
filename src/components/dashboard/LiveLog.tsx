'use client'

import { useRef, useEffect } from 'react'

interface LiveLogProps { logs: string[] }

export function LiveLog({ logs }: LiveLogProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])

  if (logs.length === 0) {
    return <div className="bg-[#0a0d12] rounded-xl border border-white/[0.06] p-6 text-center"><p className="text-slate-600 text-sm">السجل فارغ - ابدأ الجلب لرؤية التقدم</p></div>
  }

  return (
    <div className="bg-[#0a0d12] rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-slate-500 font-medium">سجل مباشر</span>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto font-mono text-xs leading-relaxed" dir="ltr">
        {logs.map((log, i) => (
          <div key={i} className="text-slate-400 whitespace-pre-wrap">
            <span className="text-slate-600 select-none mr-2">{String(i + 1).padStart(2, '0')}</span>
            {log}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
