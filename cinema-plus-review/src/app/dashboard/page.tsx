"use client";

import { useEffect, useState } from "react";
import {
  Film,
  Tv,
  Link2,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardStats {
  totalMovies: number;
  totalSeries: number;
  totalLinks: number;
  recentScrapes: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMovies: 0,
    totalSeries: 0,
    totalLinks: 0,
    recentScrapes: 0,
  });
  const [recentLogs, setRecentLogs] = useState<
    Array<{
      id: string;
      site: string;
      status: string;
      linksCount: number;
      createdAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/scrapers?type=stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Use default stats
    }

    try {
      const res = await fetch("/api/scrapers?type=logs&limit=5");
      if (res.ok) {
        const data = await res.json();
        setRecentLogs(data.logs || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "الأفلام",
      value: stats.totalMovies,
      icon: Film,
      color: "emerald",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "المسلسلات",
      value: stats.totalSeries,
      icon: Tv,
      color: "blue",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      title: "الروابط المستخرجة",
      value: stats.totalLinks,
      icon: Link2,
      color: "amber",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/20",
    },
    {
      title: "عمليات السكراب الأخيرة",
      value: stats.recentScrapes,
      icon: Activity,
      color: "purple",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/20",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={10} />
            ناجح
          </span>
        );
      case "running":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20">
            <Clock size={10} />
            جاري التشغيل
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400 border border-red-500/20">
            فاشل
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-500/15 text-gray-400 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">نظرة عامة</h1>
        <p className="text-gray-400 text-sm mt-1">
          ملخص حالة النظام والإحصائيات
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className={`bg-gray-900/60 border ${card.borderColor} backdrop-blur-sm`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-gray-400 font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-4 h-4 ${card.textColor}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {loading ? (
                <div className="h-8 bg-gray-800 rounded animate-pulse" />
              ) : (
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value.toLocaleString("ar-EG")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            آخر عمليات السكراب
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-800/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد عمليات سكراب بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-white">{log.site}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {log.linksCount} رابط
                    </span>
                    {getStatusBadge(log.status)}
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      {new Date(log.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">الإصدار</span>
              <span className="text-gray-300">2.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">قاعدة البيانات</span>
              <span className="text-emerald-400">SQLite - متصلة</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">السكرابر</span>
              <span className="text-emerald-400">نشط</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">المواقع المدعومة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Wecima</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                متاح
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">MyCima</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20">
                قريباً
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Shahid4u</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/15 text-gray-400 border border-gray-500/20">
                قيد التطوير
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
