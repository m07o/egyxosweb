import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch admin data
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')

  try {
    switch (type) {
      case 'settings': {
        let settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
        if (!settings) {
          settings = await db.siteSettings.create({ data: { id: 'main' } })
        }
        return NextResponse.json(settings)
      }

      case 'content': {
        const content = await db.customContent.findMany({
          orderBy: { order: 'asc' },
        })
        return NextResponse.json(content)
      }

      case 'servers': {
        const servers = await db.streamingServer.findMany({
          orderBy: { order: 'asc' },
        })
        return NextResponse.json(servers)
      }

      case 'messages': {
        const messages = await db.contactMessage.findMany({
          orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(messages)
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// POST - Create new items
export async function POST(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')

  try {
    switch (type) {
      case 'settings': {
        const body = await request.json()
        const settings = await db.siteSettings.upsert({
          where: { id: 'main' },
          update: {
            siteName: body.siteName,
            siteDescription: body.siteDescription,
            logoUrl: body.logoUrl,
            heroAutoPlay: body.heroAutoPlay,
            heroInterval: body.heroInterval,
          },
          create: {
            id: 'main',
            siteName: body.siteName,
            siteDescription: body.siteDescription,
            logoUrl: body.logoUrl,
            heroAutoPlay: body.heroAutoPlay,
            heroInterval: body.heroInterval,
          },
        })
        return NextResponse.json(settings)
      }

      case 'content': {
        const body = await request.json()
        const content = await db.customContent.create({
          data: {
            tmdbId: body.tmdbId,
            mediaType: body.mediaType,
            title: body.title,
            arabicTitle: body.arabicTitle,
            quality: body.quality || '1080p',
            tags: JSON.stringify(body.tags || []),
            featured: body.featured || false,
            order: body.order || 0,
          },
        })
        return NextResponse.json(content)
      }

      case 'server': {
        const body = await request.json()
        const server = await db.streamingServer.create({
          data: {
            name: body.name,
            url: body.url,
            isActive: body.isActive ?? true,
            order: body.order ?? 0,
          },
        })
        return NextResponse.json(server)
      }

      case 'message': {
        const body = await request.json()
        const message = await db.contactMessage.create({
          data: {
            name: body.name,
            email: body.email,
            message: body.message,
          },
        })
        return NextResponse.json(message)
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

// PUT - Update items
export async function PUT(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    switch (type) {
      case 'content': {
        const body = await request.json()
        const content = await db.customContent.update({
          where: { id },
          data: {
            tmdbId: body.tmdbId,
            mediaType: body.mediaType,
            title: body.title,
            arabicTitle: body.arabicTitle,
            quality: body.quality,
            tags: JSON.stringify(body.tags || []),
            featured: body.featured,
            order: body.order,
          },
        })
        return NextResponse.json(content)
      }

      case 'server': {
        const body = await request.json()
        const server = await db.streamingServer.update({
          where: { id },
          data: {
            name: body.name,
            url: body.url,
            isActive: body.isActive,
            order: body.order,
          },
        })
        return NextResponse.json(server)
      }

      case 'message': {
        const message = await db.contactMessage.update({
          where: { id },
          data: { isRead: true },
        })
        return NextResponse.json(message)
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Delete items
export async function DELETE(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    switch (type) {
      case 'content': {
        await db.customContent.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }

      case 'server': {
        await db.streamingServer.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }

      case 'message': {
        await db.contactMessage.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
