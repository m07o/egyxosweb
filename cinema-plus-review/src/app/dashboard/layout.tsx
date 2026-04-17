"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  Link2,
  Settings,
  LogOut,
  Clapperboard,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/scraper", label: "السكرابر", icon: Search },
  { href: "/dashboard/links", label: "الروابط", icon: Link2 },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Clapperboard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-sm">سينما بلس</h1>
                  <p className="text-[10px] text-gray-500">لوحة التحكم</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info + Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name || "المدير"}
                </p>
                <p className="text-[10px] text-gray-500">مدير النظام</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full justify-start gap-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:mr-64 min-h-screen">
        {/* Top bar for mobile */}
        <header className="sticky top-0 z-30 bg-[#0a0f0a]/80 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm">سينما بلس</span>
            </div>
            <div className="w-8" />
          </div>
        </header>

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
