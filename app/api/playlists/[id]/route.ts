import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUsers } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getCurrentUserFromRequest()
    if (!payload) return NextResponse.json({ error: 'Login qiling' }, { status: 401 })

    const { name } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Nom kerak' }, { status: 400 })

    const users = await getUsers()
    const idx = users.findIndex((u) => u.id === payload.userId)
    if (idx === -1) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

    const playlists = users[idx].playlists ?? []
    const pIdx = playlists.findIndex((p) => p.id === params.id)
    if (pIdx === -1) return NextResponse.json({ error: 'Playlist topilmadi' }, { status: 404 })

    playlists[pIdx].name = name.trim()
    users[idx].playlists = playlists
    await saveUsers(users)

    return NextResponse.json({ playlist: playlists[pIdx] })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getCurrentUserFromRequest()
    if (!payload) return NextResponse.json({ error: 'Login qiling' }, { status: 401 })

    const users = await getUsers()
    const idx = users.findIndex((u) => u.id === payload.userId)
    if (idx === -1) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

    const before = users[idx].playlists?.length ?? 0
    users[idx].playlists = (users[idx].playlists ?? []).filter((p) => p.id !== params.id)

    if ((users[idx].playlists?.length ?? 0) === before) {
      return NextResponse.json({ error: 'Playlist topilmadi' }, { status: 404 })
    }

    await saveUsers(users)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
