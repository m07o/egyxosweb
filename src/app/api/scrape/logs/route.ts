import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const logs = await db.scraperLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    return NextResponse.json(logs)
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
