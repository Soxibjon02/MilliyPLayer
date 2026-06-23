import { NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { getUsers } from '@/lib/jsonbin'

export async function GET() {
  try {
    const payload = await getCurrentUserFromRequest()
    if (!payload) return NextResponse.json({ user: null })

    const users = await getUsers()
    const user = users.find((u) => u.id === payload.userId)
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        favorites: user.favorites ?? [],
        playlists: user.playlists ?? [],
      },
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
