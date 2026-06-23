import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getCurrentUserFromRequest } from '@/lib/auth'

function clean(v: string | undefined): string {
  return (v ?? '').replace(/^﻿/, '').replace(/[\r\n]/g, '').trim()
}

export async function GET() {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
    }

    const apiSecret = clean(process.env.CLOUDINARY_API_SECRET)
    const apiKey = clean(process.env.CLOUDINARY_API_KEY)
    const cloudName = clean(process.env.CLOUDINARY_CLOUD_NAME)

    // Generate a test signature for a known timestamp
    const timestamp = 1700000000
    const paramsStr = `timestamp=${timestamp}`
    const signature = crypto.createHash('sha1').update(paramsStr + apiSecret).digest('hex')

    // Ping Cloudinary — simple authenticated resource list
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1&timestamp=${timestamp}&signature=${signature}&api_key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      cloud_name: cloudName,
      api_key_len: apiKey.length,
      api_secret_len: apiSecret.length,
      api_secret_first_code: apiSecret.charCodeAt(0),
      cloudinary_response: res.ok ? 'Credentials VALID ✓' : data.error?.message ?? 'Authentication failed',
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
