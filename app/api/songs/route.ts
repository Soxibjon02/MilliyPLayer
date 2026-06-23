import { NextRequest, NextResponse } from 'next/server'
import { getSongs, saveSongs, generateId } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { Song } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const songs = await getSongs()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.toLowerCase()
    const categoryId = searchParams.get('category')

    let result = songs
    if (q) {
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      )
    }
    if (categoryId) {
      result = result.filter((s) => s.categoryIds.includes(categoryId))
    }

    return NextResponse.json({ songs: result })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

// Files are uploaded directly to Cloudinary from the browser.
// This endpoint only receives the resulting URLs + metadata.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
    }

    const body = await req.json()
    const { title, artist, categoryIds, coverUrl, audioUrl, lyrics } = body

    if (!title || !artist || !coverUrl || !audioUrl) {
      return NextResponse.json({ error: "Majburiy maydonlar to'ldirilmagan" }, { status: 400 })
    }

    const song: Song = {
      id: generateId(),
      title,
      artist,
      categoryIds: categoryIds ?? [],
      coverUrl,
      audioUrl,
      lyrics: lyrics ?? '',
      playCount: 0,
      createdAt: new Date().toISOString(),
    }

    const songs = await getSongs()
    await saveSongs([...songs, song])

    return NextResponse.json({ song }, { status: 201 })
  } catch (err) {
    console.error('Create song error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
