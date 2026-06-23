import { NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth'

function cleanEnv(v: string | undefined): string {
  return (v ?? '').replace(/^﻿/, '').replace(/[\r\n]/g, '').trim()
}

export async function GET() {
  try {
    const user = await getCurrentUserFromRequest()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const BASE = 'https://api.jsonbin.io/v3/b'
    const masterKey = cleanEnv(process.env.JSONBIN_MASTER_KEY)
    const binUsers = cleanEnv(process.env.JSONBIN_BIN_USERS)
    const binCategories = cleanEnv(process.env.JSONBIN_BIN_CATEGORIES)
    const binSongs = cleanEnv(process.env.JSONBIN_BIN_SONGS)

    const results: Record<string, unknown> = {
      masterKeyLength: masterKey.length,
      masterKeyPrefix: masterKey.slice(0, 8) + '...',
      binUsers: binUsers || '(empty)',
      binCategories: binCategories || '(empty)',
      binSongs: binSongs || '(empty)',
    }

    // Test read + write on each bin
    for (const [label, binId] of [
      ['songs', binSongs],
      ['users', binUsers],
      ['categories', binCategories],
    ] as [string, string][]) {
      if (!binId) {
        results[label] = 'BIN_ID missing'
        continue
      }

      // Test READ
      const readRes = await fetch(`${BASE}/${binId}/latest`, {
        headers: { 'X-Master-Key': masterKey },
        cache: 'no-store',
      })
      if (!readRes.ok) {
        results[label] = `READ failed: ${readRes.status} ${await readRes.text().catch(() => '')}`
        continue
      }

      const current = await readRes.json()

      // Test WRITE (write same data back)
      const writeRes = await fetch(`${BASE}/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': masterKey,
        },
        body: JSON.stringify(current.record),
      })

      if (writeRes.ok) {
        results[label] = 'READ ✓  WRITE ✓'
      } else {
        const body = await writeRes.text().catch(() => '')
        results[label] = `READ ✓  WRITE FAILED: ${writeRes.status} ${body}`
      }
    }

    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
