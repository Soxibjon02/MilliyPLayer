import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUsers } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getCurrentUserFromRequest()
    if (!payload) return NextResponse.json({ error: 'Login qiling' }, { status: 401 })

    const { songId, action } = await req.json()
    if (!songId || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 })
    }

    const users = await getUsers()
    const idx = users.findIndex((u) => u.id === payload.userId)
    if (idx === -1) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

    const playlists = users[idx].playlists ?? []
    const pIdx = playlists.findIndex((p) => p.id === params.id)
    if (pIdx === -1) return NextResponse.json({ error: 'Playlist topilmadi' }, { status: 404 })

    const songIds = playlists[pIdx].songIds ?? []
    if (action === 'add' && !songIds.includes(songId)) {
      playlists[pIdx].songIds = [...songIds, songId]
    } else if (action === 'remove') {
      playlists[pIdx].songIds = songIds.filter((id) => id !== songId)
    }

    users[idx].playlists = playlists
    await saveUsers(users)

    return NextResponse.json({ playlist: playlists[pIdx] })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
