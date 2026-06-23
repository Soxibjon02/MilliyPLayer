import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getCurrentUserFromRequest } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
    }

    const { folder } = await req.json()
    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = { folder, timestamp }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY!,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      folder,
    })
  } catch (err) {
    console.error('Sign error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
