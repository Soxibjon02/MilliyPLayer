import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getCurrentUserFromRequest } from '@/lib/auth'

// Strip BOM (U+FEFF), carriage returns, newlines, and surrounding whitespace
function clean(v: string | undefined): string {
  return (v ?? '').replace(/^﻿/, '').replace(/[\r\n]/g, '').trim()
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
    }

    const { folder } = await req.json()
    if (!folder) return NextResponse.json({ error: 'folder kerak' }, { status: 400 })

    const timestamp = Math.round(Date.now() / 1000)
    const apiSecret = clean(process.env.CLOUDINARY_API_SECRET)
    const apiKey = clean(process.env.CLOUDINARY_API_KEY)
    const cloudName = clean(process.env.CLOUDINARY_CLOUD_NAME)

    // Log diagnostics (without revealing secret value)
    console.log(`[cloudinary/sign] cloud=${cloudName} key_len=${apiKey.length} secret_len=${apiSecret.length} first_code=${apiSecret.charCodeAt(0)}`)

    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json({ error: 'Cloudinary env vars sozlanmagan' }, { status: 500 })
    }

    // Cloudinary: SHA-1( "param1=v1&param2=v2" + api_secret ), params sorted A→Z
    const paramsStr = `folder=${folder}&timestamp=${timestamp}`
    const signature = crypto.createHash('sha1').update(paramsStr + apiSecret).digest('hex')

    return NextResponse.json({ signature, timestamp, api_key: apiKey, cloud_name: cloudName, folder })
  } catch (err) {
    console.error('Sign error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
