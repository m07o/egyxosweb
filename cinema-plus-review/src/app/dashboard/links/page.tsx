"use client";

import { useEffect, useState } from "react";
import {
  Link2,
  ExternalLink,
  Copy,
  CheckCircle2,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ScrapedLink {
  id: string;
  title: string;
  url: string;
  quality: string;
  site: string;
  type: string;
  createdAt: string;
}

export default function LinksPage() {
  const [links, setLinks] = useState<ScrapedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuality, setFilterQuality] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/scrapers?type=links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuality =
      filterQuality === "all" || link.quality === filterQuality;
    return matchesSearch && matchesQuality;
  });

  const qualityColors: Record<string, string> = {
    "1080p": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "720p": "bg-blue-500/15 text-blue-400 border-blue-500/20",
    "480p": "bg-amber-500/15 text-amber-400 border-amber-500/20",
    "360p": "bg-gray-500/15 text-gray-400 border-gray-500/20",
    default: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">الروابط المستخرجة</h1>
        <p className="text-gray-400 text-sm mt-1">
          جميع روابط المشاهدة والتحميل المستخرجة من السكرابر
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                type="text"
                placeholder="بحث في الروابط..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10 pr-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {["all", "1080p", "720p", "480p"].map((quality) => (
                <Button
                  key={quality}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterQuality(quality)}
                  className={`text-xs h-8 px-3 ${
                    filterQuality === quality
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  {quality === "all" ? "الكل" : quality}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          عرض {filteredLinks.length} رابط من أصل {links.length}
        </p>
      </div>

      {/* Links list */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-800/50 rounded-lg animate-pulse"
            />
          ))
        ) : filteredLinks.length === 0 ? (
          <Card className="bg-gray-900/60 border-gray-800">
            <CardContent className="py-12 text-center text-gray-500">
              <Link2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">لا توجد روابط مستخرجة</p>
              <p className="text-xs mt-1">
                قم بتشغيل السكرابر أولاً لاستخراج الروابط
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{link.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {link.site} • {link.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mr-3 flex-shrink-0">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${qualityColors[link.quality] || qualityColors.default}`}
                >
                  {link.quality}
                </span>
                <span className="text-[10px] text-gray-500 hidden sm:inline">
                  {new Date(link.createdAt).toLocaleDateString("ar-EG")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyLink(link.url, link.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-emerald-400"
                >
                  {copiedId === link.id ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
