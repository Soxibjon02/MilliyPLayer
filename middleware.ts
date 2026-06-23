import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'millyplayer_token'
const AUTH_PAGES = ['/login', '/register']
const PROTECTED_PATHS = ['/favorites', '/admin', '/playlists']

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // CORS: handle API routes
  if (pathname.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
    }
    const res = NextResponse.next()
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }

  const hasToken = req.cookies.has(COOKIE_NAME)

  // Root → home always
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // Auth pages → redirect if already logged in
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (hasToken) return NextResponse.redirect(new URL('/home', req.url))
    return NextResponse.next()
  }

  // Only favorites and admin require login
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !hasToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
