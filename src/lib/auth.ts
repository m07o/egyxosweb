// ============================================================
// src/lib/auth.ts — NextAuth Config (Admin + Users)
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
// التحقق من NEXTAUTH_SECRET
// ═══════════════════════════════════════════════════════════
function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "[SECURITY] NEXTAUTH_SECRET is required and must be at least 32 characters."
    );
  }
  return secret;
}

// ═══════════════════════════════════════════════════════════
// Brute Force Settings
// ═══════════════════════════════════════════════════════════
const BRUTE_FORCE_MAX_ATTEMPTS = 5;
const BRUTE_FORCE_LOCKOUT_MS = 15 * 60 * 1000; // 15 دقيقة

export const authOptions: NextAuthOptions = {
  providers: [
    // ───────────────────────────────────────
    // Admin Login Provider
    // ───────────────────────────────────────
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        username: { label: "Admin Username", type: "text" },
        password: { label: "Admin Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const clientIp = getClientIp(request! as unknown as Request);
        const lockKey = `admin-${clientIp}`;

        // Check if IP is locked out
        const lockStatus = isLockedOut(lockKey);
        if (lockStatus.locked) {
          const remainingMin = Math.ceil(
            ((lockStatus.lockedUntil as number) - Date.now()) / 60000
          );
          console.warn(
            `[SECURITY] Blocked admin login attempt from IP ${clientIp} — locked for ${remainingMin} more minutes`
          );
          throw new Error(
            `تم حظر تسجيل الدخول. حاول بعد ${remainingMin} دقيقة.`
          );
        }

        // Find admin
        const admin = await db.admin.findUnique({
          where: { username: credentials.username },
        });

        if (!admin) {
          recordFailedLogin(lockKey, {
            maxAttempts: BRUTE_FORCE_MAX_ATTEMPTS,
            lockoutMs: BRUTE_FORCE_LOCKOUT_MS,
          });
          console.warn(
            `[SECURITY] Failed admin login for unknown user "${credentials.username}" from IP ${clientIp}`
          );
          return null;
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password,
          admin.password
        );

        if (!isPasswordValid) {
          const bf = recordFailedLogin(lockKey, {
            maxAttempts: BRUTE_FORCE_MAX_ATTEMPTS,
            lockoutMs: BRUTE_FORCE_LOCKOUT_MS,
          });
          console.warn(
            `[SECURITY] Failed admin login attempt for user "${admin.username}" from IP ${clientIp}`
          );
          return null;
        }

        // Successful login
        recordSuccessfulLogin(lockKey);
        console.log(
          `[AUTH] Admin login successful: "${admin.username}" from IP ${clientIp}`
        );

        return {
          id: admin.id,
          name: admin.username,
          email: admin.email || "admin@localhost",
          image: "admin",
        };
      },
    }),

    // ───────────────────────────────────────
    // User Login Provider (Email + Password)
    // ───────────────────────────────────────
    CredentialsProvider({
      id: "user-credentials",
      name: "User Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const clientIp = getClientIp(request! as unknown as Request);
        const lockKey = `user-${clientIp}`;

        // Check if IP is locked out
        const lockStatus = isLockedOut(lockKey);
        if (lockStatus.locked) {
          const remainingMin = Math.ceil(
            ((lockStatus.lockedUntil as number) - Date.now()) / 60000
          );
          console.warn(
            `[SECURITY] Blocked user login attempt from IP ${clientIp}`
          );
          throw new Error(
            `تم حظر تسجيل الدخول. حاول بعد ${remainingMin} دقيقة.`
          );
        }

        // Find user
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          recordFailedLogin(lockKey, {
            maxAttempts: BRUTE_FORCE_MAX_ATTEMPTS,
            lockoutMs: BRUTE_FORCE_LOCKOUT_MS,
          });
          console.warn(
            `[SECURITY] Failed user login for unknown email "${credentials.email}" from IP ${clientIp}`
          );
          return null;
        }

        if (user.isBanned) {
          console.warn(`[SECURITY] Login attempt for banned user "${user.email}"`);
          throw new Error("حسابك محظور.");
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          recordFailedLogin(lockKey, {
            maxAttempts: BRUTE_FORCE_MAX_ATTEMPTS,
            lockoutMs: BRUTE_FORCE_LOCKOUT_MS,
          });
          console.warn(
            `[SECURITY] Failed user login attempt for "${user.email}" from IP ${clientIp}`
          );
          return null;
        }

        // Successful login
        recordSuccessfulLogin(lockKey);
        console.log(
          `[AUTH] User login successful: "${user.email}" from IP ${clientIp}`
        );

        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 ساعة
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        // Determine if admin based on provider
        token.isAdmin = user.image === "admin" ? true : false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        (session.user as any).isAdmin = token.isAdmin || false;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

