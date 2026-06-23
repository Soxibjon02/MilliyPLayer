import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUsers, generateId } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { Playlist } from '@/lib/types'

export async function GET() {
  try {
    const payload = await getCurrentUserFromRequest()
    if (!payload) return NextResponse.json({ error: 'Login qiling' }, { status: 401 })

    const users = await getUsers()
    const user = users.find((u) => u.id === payload.userId)
    if (!user) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

    return NextResponse.json({ playlists: user.playlists ?? [] })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUserFromRequest()
    if (!payload) return NextResponse.json({ error: 'Login qiling' }, { status: 401 })

    const { name } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Nom kerak' }, { status: 400 })

    const users = await getUsers()
    const idx = users.findIndex((u) => u.id === payload.userId)
    if (idx === -1) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

    const playlist: Playlist = {
      id: generateId(),
      name: name.trim(),
      songIds: [],
      createdAt: new Date().toISOString(),
    }

    users[idx].playlists = [...(users[idx].playlists ?? []), playlist]
    await saveUsers(users)

    return NextResponse.json({ playlist }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
