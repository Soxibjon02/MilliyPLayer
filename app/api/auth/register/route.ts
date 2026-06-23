import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUsers, generateId } from '@/lib/jsonbin'
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth'
import { User } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 })
    }

    const users = await getUsers()
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return NextResponse.json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }, { status: 409 })
    }

    const newUser: User = {
      id: generateId(),
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role: 'user',
      favorites: [],
      playlists: [],
      createdAt: new Date().toISOString(),
    }

    await saveUsers([...users, newUser])

    const token = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role })
    const res = NextResponse.json({
      token, // returned for mobile clients
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, favorites: [], playlists: [] },
    })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
