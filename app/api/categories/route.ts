import { NextRequest, NextResponse } from 'next/server'
import { getCategories, saveCategories, generateId } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { Category } from '@/lib/types'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const { name } = await req.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Kategoriya nomi kerak' }, { status: 400 })
    }

    const categories = await getCategories()
    const exists = categories.find((c) => c.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      return NextResponse.json({ error: 'Bu kategoriya allaqachon mavjud' }, { status: 409 })
    }

    const category: Category = {
      id: generateId(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    }

    await saveCategories([...categories, category])
    return NextResponse.json({ category }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
