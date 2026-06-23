import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUsers } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUserFromRequest()
    if (!payload) return NextResponse.json({ error: 'Login qiling' }, { status: 401 })

    const { songId, action } = await req.json()
    if (!songId || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 })
    }

    const users = await getUsers()
    const idx = users.findIndex((u) => u.id === payload.userId)
    if (idx === -1) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })

    const favorites = users[idx].favorites ?? []
    if (action === 'add' && !favorites.includes(songId)) {
      users[idx].favorites = [...favorites, songId]
    } else if (action === 'remove') {
      users[idx].favorites = favorites.filter((id) => id !== songId)
    }

    await saveUsers(users)
    return NextResponse.json({ favorites: users[idx].favorites })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
