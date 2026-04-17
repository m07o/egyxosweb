import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
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
  session: {
    strategy: "jwt",
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
  secret: process.env.NEXTAUTH_SECRET,
};
