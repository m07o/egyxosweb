// ============================================================
// POST /api/auth/register — تسجيل مستخدم عادي جديد
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        {
          error: "البريد والكلمة السرية مطلوبة (6 أحرف على الأقل)",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "المستخدم موجود بالفعل" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
      },
    });

    console.log(`[AUTH] New user registered: ${email}`);

    return NextResponse.json(
      {
        message: "تم التسجيل بنجاح",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AUTH] Registration error:", error);
    return NextResponse.json(
      { error: "خطأ في التسجيل" },
      { status: 500 }
    );
  }
}
