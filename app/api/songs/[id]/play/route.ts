import { NextRequest, NextResponse } from 'next/server'
import { getSongs, saveSongs } from '@/lib/jsonbin'

// Tracks recent increments in-memory per process (anti-spam)
const recentPlays = new Map<string, number>()
const DEBOUNCE_MS = 30_000 // 30 seconds per song per server instance

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const key = params.id
    const now = Date.now()
    const last = recentPlays.get(key)
    if (last && now - last < DEBOUNCE_MS) {
      return NextResponse.json({ ok: true, skipped: true })
    }
    recentPlays.set(key, now)

    const songs = await getSongs()
    const idx = songs.findIndex((s) => s.id === key)
    if (idx === -1) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

    songs[idx].playCount = (songs[idx].playCount ?? 0) + 1
    await saveSongs(songs)

    return NextResponse.json({ playCount: songs[idx].playCount })
  } catch (err) {
    console.error('Play count error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
