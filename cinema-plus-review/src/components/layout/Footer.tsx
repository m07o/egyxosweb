'use client'

import { Clapperboard } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-8 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clapperboard className="size-5 text-streaming-accent" />
            <span className="text-lg font-bold text-white">
              سينما <span className="text-streaming-accent">بلس</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} سينما بلس — جميع الحقوق محفوظة
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <button className="hover:text-white transition-colors">سياسة الخصوصية</button>
            <button className="hover:text-white transition-colors">اتصل بنا</button>
            <button className="hover:text-white transition-colors">شروط الاستخدام</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
