import { NextRequest, NextResponse } from 'next/server'
import { getCategories, saveCategories } from '@/lib/jsonbin'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    const idx = categories.findIndex((c) => c.id === params.id)
    if (idx === -1) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

    categories[idx].name = name.trim()
    await saveCategories(categories)
    return NextResponse.json({ category: categories[idx] })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const categories = await getCategories()
    const filtered = categories.filter((c) => c.id !== params.id)
    if (filtered.length === categories.length) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
    }

    await saveCategories(filtered)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
