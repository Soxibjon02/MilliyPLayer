import { NextRequest, NextResponse } from 'next/server'
import { getSongs, saveSongs } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { uploadImage, uploadAudio } from '@/lib/cloudinary'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const songs = await getSongs()
    const song = songs.find((s) => s.id === params.id)
    if (!song) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
    return NextResponse.json({ song })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const body = await req.json()
    const { title, artist, categoryIds, coverBase64, audioBase64, lyrics } = body

    const songs = await getSongs()
    const idx = songs.findIndex((s) => s.id === params.id)
    if (idx === -1) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

    const existing = songs[idx]
    let coverUrl = existing.coverUrl
    let audioUrl = existing.audioUrl

    if (coverBase64) coverUrl = await uploadImage(coverBase64)
    if (audioBase64) audioUrl = await uploadAudio(audioBase64)

    songs[idx] = {
      ...existing,
      title: title ?? existing.title,
      artist: artist ?? existing.artist,
      categoryIds: categoryIds ?? existing.categoryIds,
      coverUrl,
      audioUrl,
      lyrics: lyrics ?? existing.lyrics,
    }

    await saveSongs(songs)
    return NextResponse.json({ song: songs[idx] })
  } catch (err) {
    console.error('Update song error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const songs = await getSongs()
    const filtered = songs.filter((s) => s.id !== params.id)
    if (filtered.length === songs.length) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
    }

    await saveSongs(filtered)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
