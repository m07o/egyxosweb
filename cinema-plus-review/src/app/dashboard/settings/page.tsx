"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  Key,
  User,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(session?.user?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword) {
      setMessage({ type: "error", text: "يرجى إدخال كلمة المرور الحالية" });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "كلمة المرور الجديدة غير متطابقة",
      });
      return;
    }

    if (!newPassword && !newUsername) {
      setMessage({
        type: "error",
        text: "يرجى تعديل اسم المستخدم أو كلمة المرور",
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/scrapers?type=settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "تم تحديث البيانات بنجاح" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "حدث خطأ" });
      }
    } catch {
      setMessage({ type: "error", text: "حدث خطأ في الاتصال" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <p className="text-gray-400 text-sm mt-1">
          إعدادات الحساب والنظام
        </p>
      </div>

      {/* Current user info */}
      <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            معلومات الحساب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {session?.user?.name || "المدير"}
              </p>
              <p className="text-xs text-gray-500">مدير النظام</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change credentials */}
      <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            تغيير بيانات الدخول
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs">
            يمكنك تغيير اسم المستخدم أو كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangeCredentials} className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {message.text}
              </div>
            )}

            {/* Current password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-300 text-sm">
                كلمة المرور الحالية
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10"
                required
              />
            </div>

            {/* New username */}
            <div className="space-y-2">
              <Label htmlFor="newUsername" className="text-gray-300 text-sm">
                اسم المستخدم الجديد
              </Label>
              <Input
                id="newUsername"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={session?.user?.name || "admin"}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10"
              />
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300 text-sm">
                كلمة المرور الجديدة (اختياري)
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="اتركه فارغاً إذا لم ترد تغييره"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10"
              />
            </div>

            {/* Confirm password */}
            {newPassword && (
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-300 text-sm"
                >
                  تأكيد كلمة المرور الجديدة
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="bg-gray-900/60 border-red-500/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-400 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            منطقة الخطر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-gray-400">
            إعادة تعيين قاعدة البيانات ستحذف جميع البيانات المستخرجة وتعيد
            الإعدادات إلى حالتها الافتراضية.
          </p>
          <Button
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
            onClick={async () => {
              if (
                window.confirm(
                  "هل أنت متأكد من إعادة تعيين قاعدة البيانات؟ سيتم حذف جميع البيانات."
                )
              ) {
                try {
                  const res = await fetch("/api/scrapers?type=reset-db", {
                    method: "DELETE",
                  });
                  if (res.ok) {
                    alert("تم إعادة تعيين قاعدة البيانات بنجاح");
                  }
                } catch {
                  alert("حدث خطأ");
                }
              }
            }}
          >
            إعادة تعيين قاعدة البيانات
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
