import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getCurrentUserFromRequest } from '@/lib/auth'

function clean(v: string | undefined) {
  return (v ?? '').replace(/^﻿/, '').trim()
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

    // Cloudinary: SHA-1( "param1=v1&param2=v2" + api_secret ), params sorted alphabetically
    const paramsStr = `folder=${folder}&timestamp=${timestamp}`
    const signature = crypto.createHash('sha1').update(paramsStr + apiSecret).digest('hex')

    return NextResponse.json({
      signature,
      timestamp,
      api_key: clean(process.env.CLOUDINARY_API_KEY),
      cloud_name: clean(process.env.CLOUDINARY_CLOUD_NAME),
      folder,
    })
  } catch (err) {
    console.error('Sign error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
