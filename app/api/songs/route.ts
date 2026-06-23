import { NextRequest, NextResponse } from 'next/server'
import { getSongs, saveSongs, generateId } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { uploadImage, uploadAudio } from '@/lib/cloudinary'
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

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const body = await req.json()
    const { title, artist, categoryIds, coverBase64, audioBase64, lyrics } = body

    if (!title || !artist || !coverBase64 || !audioBase64) {
      return NextResponse.json({ error: "Majburiy maydonlar to'ldirilmagan" }, { status: 400 })
    }

    const [coverUrl, audioUrl] = await Promise.all([
      uploadImage(coverBase64),
      uploadAudio(audioBase64),
    ])

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
