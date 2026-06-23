import { NextResponse } from 'next/server'
import { getUsers, saveUsers, generateId } from '@/lib/jsonbin'
import { hashPassword } from '@/lib/auth'
import { User } from '@/lib/types'

// POST /api/auth/seed — creates the first admin user from env vars
export async function POST() {
  try {
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
