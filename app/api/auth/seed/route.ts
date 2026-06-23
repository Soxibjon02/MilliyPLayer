import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUsers, generateId } from '@/lib/jsonbin'
import { hashPassword } from '@/lib/auth'
import { User } from '@/lib/types'

// POST /api/auth/seed — creates the first admin user from env vars
// Requires header: x-seed-secret: <SEED_SECRET env var>
export async function POST(req: NextRequest) {
  try {
    const seedSecret = process.env.SEED_SECRET
    if (!seedSecret) {
      return NextResponse.json(
        { error: 'SEED_SECRET .env faylida belgilanmagan' },
        { status: 500 }
      )
    }

    const provided = req.headers.get('x-seed-secret')
    if (provided !== seedSecret) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_EMAIL va ADMIN_PASSWORD .env faylida belgilanmagan' },
        { status: 400 }
      )
    }

    const users = await getUsers()
    const exists = users.find((u) => u.email.toLowerCase() === adminEmail.toLowerCase())
    if (exists) {
      return NextResponse.json({ message: 'Admin allaqachon mavjud' })
    }

    const admin: User = {
      id: generateId(),
      name: 'Admin',
      email: adminEmail.toLowerCase(),
      passwordHash: hashPassword(adminPassword),
      role: 'admin',
      favorites: [],
      createdAt: new Date().toISOString(),
    }

    await saveUsers([...users, admin])
    return NextResponse.json({ message: 'Admin muvaffaqiyatli yaratildi' })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
