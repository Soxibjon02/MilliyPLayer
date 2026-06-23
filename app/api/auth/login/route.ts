import { NextRequest, NextResponse } from 'next/server'
import { getUsers } from '@/lib/jsonbin'
import { verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email va parolni kiriting" }, { status: 400 })
    }

    const users = await getUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 })
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        favorites: user.favorites ?? [],
      },
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
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
