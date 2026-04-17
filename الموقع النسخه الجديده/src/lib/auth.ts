import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'تسجيل الدخول',
      credentials: {
        username: { label: 'اسم المستخدم', type: 'text' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('اسم المستخدم وكلمة المرور مطلوبان')
        }

        const admin = await db.admin.findUnique({
          where: { username: credentials.username },
        })

        if (!admin) {
          throw new Error('اسم المستخدم غير موجود')
        }

        if (!admin.isActive) {
          throw new Error('هذا الحساب معطل')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.password
        )

        if (!isPasswordValid) {
          throw new Error('كلمة المرور غير صحيحة')
        }

        await db.admin.update({
          where: { id: admin.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: admin.id,
          name: admin.username,
          role: admin.role,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.role = (user as Record<string, unknown>).role || 'ADMIN'
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.sub
        (session.user as Record<string, unknown>).role = token.role
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET || 'cinemaplus-secret-key-change-in-production',
}
