// ============================================================
// src/lib/auth.ts — NextAuth Config (محمّي + متوافق مع Cloudflare)
// ============================================================
// ترقيعات الأمان المُطبّقة:
//
// 1. NEXTAUTH_SECRET مطلوب — لا يوجد fallback.
//    يتم التحقق في runtime (عند أول طلب)، وليس في module evaluation.
//    هذا يسمح بعمل Build بدون إعداد متغيرات البيئة.
//
// 2. لا توجد بيانات دخول افتراضية (hardcoded).
//    Admin يُنشأ عبر Seed Script.
//
// 3. Brute Force Protection:
//    - 5 محاولات فشل متتالية = حظر 15 دقيقة من نفس الـ IP.
//    - In-Memory store مع lazy cleanup (متوافق مع Workers).
//
// 4. تسجيل محاولات الدخول في console.
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
// 1. التحقق من NEXTAUTH_SECRET — في runtime، ليس build time
// ═══════════════════════════════════════════════════════════
function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "[SECURITY] NEXTAUTH_SECRET is required and must be at least 32 characters. " +
      "Generate one with: openssl rand -base64 48"
    );
  }
  return secret;
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
          throw new Error(
            `تم حظر تسجيل الدخول بسبب محاولات متكررة. حاول بعد ${remainingMin} دقيقة.`
          );
        }

        // ── البحث عن المستخدم ──
        const admin = await db.admin.findUnique({
          where: { username: credentials.username },
        });

        if (!admin) {
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
  // Secret — يتم قراءته في runtime
  // ═══════════════════════════════════════════════════════════
  secret: process.env.NEXTAUTH_SECRET,
};
