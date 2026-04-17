"use client";

import { useState } from "react";
import {
  Play,
  RefreshCw,
  Trash2,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ScrapeResult {
  id: string;
  site: string;
  status: string;
  linksCount: number;
  message: string;
  createdAt: string;
}

export default function ScraperPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ScrapeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState("wecima");

  const sites = [
    {
      id: "wecima",
      name: "Wecima",
      url: "wecima.bar",
      available: true,
    },
    {
      id: "mycima",
      name: "MyCima",
      url: "mycima.cc",
      available: false,
    },
  ];

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/scrapers?type=logs&limit=20");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchLogs();
  });

  const runScraper = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/scrapers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site: selectedSite }),
      });

      const data = await res.json();

      if (data.log) {
        setLogs((prev) => [data.log, ...prev]);
      }
    } catch {
      // silent fail
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch("/api/scrapers?type=clear", { method: "DELETE" });
      setLogs([]);
    } catch {
      // silent fail
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "ناجح";
      case "error":
        return "فاشل";
      case "running":
        return "جاري التشغيل";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">السكرابر</h1>
        <p className="text-gray-400 text-sm mt-1">
          استخراج الروابط من مواقع الأفلام والمسلسلات
        </p>
      </div>

      {/* Controls */}
      <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            تشغيل السكرابر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              >
                {sites.map((site) => (
                  <option
                    key={site.id}
                    value={site.id}
                    disabled={!site.available}
                  >
                    {site.name} ({site.url})
                    {!site.available && " - غير متاح"}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={runScraper}
              disabled={isRunning}
              className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? "جاري الاستخراج..." : "تشغيل"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-gray-400" />
              سجل العمليات
            </CardTitle>
            {logs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLogs}
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 gap-1"
              >
                <Trash2 size={14} />
                مسح السجل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-800/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">لا توجد عمليات سكراب بعد</p>
              <p className="text-xs mt-1">اختر موقع وقم بتشغيل السكرابر</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="text-sm text-white">{log.site}</p>
                      {log.message && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {log.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-sm text-gray-300">
                      {log.linksCount} رابط
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        log.status === "success"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : log.status === "error"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-gray-500/15 text-gray-400"
                      }`}
                    >
                      {getStatusText(log.status)}
                    </span>
                    <span className="text-xs text-gray-500 hidden md:inline">
                      {new Date(log.createdAt).toLocaleString("ar-EG")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
