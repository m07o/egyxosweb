// ============================================================
// src/lib/auth.ts - NextAuth متوافق مع Cloudflare Workers + PostgreSQL
// ============================================================
// التغييرات:
// 1. استخدام @auth/prisma-adapter لحفظ الجلسات في PostgreSQL
//    بدلاً من JWT-only (للتوافق مع بيئة Serverless)
// 2. إعداد Cookies للعمل على HTTPS (Cloudflare)
// 3. استخدام token.sub بدلاً من token.id (إصلاح خطأ معروف)
// ============================================================

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  // ═══════════════════════════════════════════════════════════
  // Prisma Adapter - يحفظ الجلسات والـ tokens في PostgreSQL
  // هذا يمنع مشاكل JWT على Cloudflare Workers
  // ═══════════════════════════════════════════════════════════
  adapter: PrismaAdapter(db),

  providers: [
    CredentialsProvider({
      name: "تسجيل الدخول",
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const admin = await db.admin.findUnique({
          where: { username: credentials.username },
        });

        if (!admin) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          admin.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: admin.id,
          name: admin.username,
        };
      },
    }),
  ],

  // ═══════════════════════════════════════════════════════════
  // Session Strategy - database للـ Serverless
  // ═══════════════════════════════════════════════════════════
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 يوم
  },

  callbacks: {
    // تنبيه: لا تستخدم token.id أبداً - يتعارض مع JWT built-in .id()
    // استخدم token.sub بدلاً من ذلك
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.name = user.name;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  // ═══════════════════════════════════════════════════════════
  // Security - مهم جداً على Cloudflare
  // ═══════════════════════════════════════════════════════════
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true, // HTTPS على Cloudflare
      },
    },
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
};
