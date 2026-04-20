import Link from 'next/link';
import { Clapperboard } from 'lucide-react';

const quickLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/browse', label: 'تصفح' },
  { href: '/search', label: 'البحث' },
  { href: '/watchlist', label: 'قائمتي' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060609]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Logo & description */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Clapperboard className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-white font-bold text-lg">
                سينما <span className="text-emerald-400">بلس</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              منصتك المفضلة لمشاهدة الأفلام والمسلسلات والأنمي بأعلى جودة وترجمة عربية احترافية.
            </p>
          </div>

          {/* Quick links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} سينما بلس. جميع الحقوق محفوظة.
            </p>
            <p className="text-xs text-slate-700">
              تم التطوير بـ ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
