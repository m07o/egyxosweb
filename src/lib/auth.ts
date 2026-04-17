// ============================================================
// src/lib/auth.ts — NextAuth Config (محمّي)
// ============================================================
// ترقيعات الأمان المُطبّقة:
//
// 1. NEXTAUTH_SECRET مطلوب — لا يوجد fallback.
//    إذا لم يُعرّف المتغير، يرمي Error ويمنع التشغيل.
//
// 2. لا توجد بيانات دخول افتراضية (hardcoded).
//    Admin يُنشأ عبر Seed Script بقراءة:
//      - ADMIN_USERNAME (يجب أن يكون 3 أحرف على الأقل)
//      - ADMIN_PASSWORD (يجب أن يكون 8 أحرف على الأقل)
//
// 3. Brute Force Protection:
//    - 5 محاولات فشل متتالية = حظر 15 دقيقة من نفس الـ IP.
//    - يُستخدم In-Memory store مع تنظيف تلقائي.
//    - نجاح تسجيل الدخول يمسح عداد المحاولات.
//
// 4. تسجيل محاولات الدخول في console (يمكن ربطه بـ SIEM).
// ============================================================

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { compare } from "bcryptjs";
import {
  recordFailedLogin,
  recordSuccessfulLogin,
  isLockedOut,
  getClientIp,
} from "./rate-limiter";

// ═══════════════════════════════════════════════════════════
// 1. التحقق من NEXTAUTH_SECRET — مطلوب، لا يوجد fallback
// ═══════════════════════════════════════════════════════════
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET || NEXTAUTH_SECRET.length < 32) {
  throw new Error(
    "[SECURITY] NEXTAUTH_SECRET is required and must be at least 32 characters. " +
    "Set it in your .env file. Generate one with: openssl rand -base64 48"
  );
}

// ═══════════════════════════════════════════════════════════
// 2. إعدادات Brute Force
// ═══════════════════════════════════════════════════════════
const BRUTE_FORCE_MAX_ATTEMPTS = 5;
const BRUTE_FORCE_LOCKOUT_MS = 15 * 60 * 1000; // 15 دقيقة

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "تسجيل الدخول",
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // ── استخراج IP ──
        const clientIp = getClientIp(request! as unknown as Request);

        // ── فحص هل الـ IP محظور بسبب محاولات سابقة ──
        const lockStatus = isLockedOut(clientIp);
        if (lockStatus.locked) {
          const remainingMin = Math.ceil(
            ((lockStatus.lockedUntil as number) - Date.now()) / 60000
          );
          console.warn(
            `[SECURITY] Blocked login attempt from IP ${clientIp} — locked for ${remainingMin} more minutes`
          );
          // نرمي خطأ مخصص سيتم التقاطه في login page
          throw new Error(
            `تم حظر تسجيل الدخول بسبب محاولات متكررة. حاول بعد ${remainingMin} دقيقة.`
          );
        }

        // ── البحث عن المستخدم ──
        const admin = await db.admin.findUnique({
          where: { username: credentials.username },
        });

        if (!admin) {
          // لا تُعلِم المهاجم أن المستخدم غير موجود
          // سجّل المحاولة الفاشلة فقط
          const bf = recordFailedLogin(clientIp, {
            maxAttempts: BRUTE_FORCE_MAX_ATTEMPTS,
            lockoutMs: BRUTE_FORCE_LOCKOUT_MS,
          });
          console.warn(
            `[SECURITY] Failed login attempt for unknown user "${credentials.username}" from IP ${clientIp} — remaining: ${bf.remainingAttempts}`
          );
          return null;
        }

        // ── التحقق من كلمة المرور ──
        const isPasswordValid = await compare(
          credentials.password,
          admin.password
        );

        if (!isPasswordValid) {
          const bf = recordFailedLogin(clientIp, {
            maxAttempts: BRUTE_FORCE_MAX_ATTEMPTS,
            lockoutMs: BRUTE_FORCE_LOCKOUT_MS,
          });
          console.warn(
            `[SECURITY] Failed login attempt for user "${admin.username}" from IP ${clientIp} — remaining: ${bf.remainingAttempts}` +
              (bf.locked ? ` [LOCKED for ${Math.ceil(BRUTE_FORCE_LOCKOUT_MS / 60000)} min]` : "")
          );
          return null;
        }

        // ── نجاح تسجيل الدخول ──
        recordSuccessfulLogin(clientIp);
        console.log(
          `[AUTH] Successful login: user "${admin.username}" from IP ${clientIp}`
        );

        return {
          id: admin.id,
          name: admin.username,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 ساعة
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  // ═══════════════════════════════════════════════════════════
  // 3. Secret — مطلوب، لا يوجد fallback
  // ═══════════════════════════════════════════════════════════
  secret: NEXTAUTH_SECRET,
};
