import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // ✅ Auth check - only admins can change credentials
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token || !(token as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newUsername, newPassword } = body

    const admins = await db.admin.findMany({ take: 1 })
    if (admins.length === 0) return NextResponse.json({ error: 'No admin account' }, { status: 404 })
    const admin = admins[0]

    if (currentPassword) {
      const isCorrect = await bcrypt.compare(currentPassword, admin.password)
      if (!isCorrect) return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 })
    }

    const updateData: { username?: string; password?: string } = {}
    if (newUsername && newUsername.trim()) {
      const existing = await db.admin.findUnique({ where: { username: newUsername.trim() } })
      if (existing && existing.id !== admin.id) return NextResponse.json({ error: 'اسم المستخدم موجود بالفعل' }, { status: 400 })
      updateData.username = newUsername.trim()
    }
    if (newPassword && newPassword.length >= 4) updateData.password = await bcrypt.hash(newPassword, 12)
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'No changes' }, { status: 400 })

    await db.admin.update({ where: { id: admin.id }, data: updateData })
    return NextResponse.json({ success: true, message: 'Updated' })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}
