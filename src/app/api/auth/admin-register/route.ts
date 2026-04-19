// ============================================================
// POST /api/auth/admin-register — تسجيل مسؤول جديد
// يتطلب المصادقة كمسؤول موجود
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // ✅ Auth check - only existing admins can create new admins
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !(token as any).isAdmin) {
      console.warn(`[SECURITY] Unauthorized admin registration attempt`);
      return NextResponse.json(
        { error: "Unauthorized - Admins only" },
        { status: 401 }
      );
    }

    const { username, password, email } = await request.json();

    // Validation
    if (!username || !password || password.length < 6) {
      return NextResponse.json(
        {
          error: "اسم المستخدم وكلمة السرية مطلوبة (6 أحرف على الأقل)",
        },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await db.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "اسم المستخدم موجود بالفعل" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create admin
    const admin = await db.admin.create({
      data: {
        username,
        password: hashedPassword,
        email: email || null,
      },
    });

    console.log(`[AUTH] New admin registered: ${username}`);

    return NextResponse.json(
      {
        message: "تم تسجيل الأدمن بنجاح",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AUTH] Admin registration error:", error);
    return NextResponse.json(
      { error: "خطأ في التسجيل" },
      { status: 500 }
    );
  }
}
