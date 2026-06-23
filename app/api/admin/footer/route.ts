import { NextRequest, NextResponse } from 'next/server'
import { getFooterSettings, saveFooterSettings } from '@/lib/footerDb'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await getFooterSettings()
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
    }

    const { email, developerName, developerRole, description, techStack } = await req.json()
    if (!email?.trim() || !developerName?.trim()) {
      return NextResponse.json({ error: "Ma'lumotlar yetarli emas" }, { status: 400 })
    }

    const updated = {
      email: email.trim(),
      developerName: developerName.trim(),
      developerRole: developerRole.trim() || 'Full-stack Developer',
      description: description.trim() || "O'zbek milliy musiqasini sevuvchilar uchun zamonaviy musiqa streaming platforma.",
      techStack: techStack.trim() || 'Next.js 14, TypeScript, Tailwind CSS, Cloudinary va JSONBin.io bilan qurildi.',
    }

    await saveFooterSettings(updated)
    return NextResponse.json({ settings: updated })
  } catch (err) {
    console.error('Footer settings save error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
