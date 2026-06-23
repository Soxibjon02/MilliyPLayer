import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'millyplayer_token'
const PUBLIC_PATHS = ['/login', '/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow static and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const hasToken = req.cookies.has(COOKIE_NAME)

  // Root → redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasToken ? '/home' : '/login', req.url))
  }

  // Auth pages → redirect if logged in
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (hasToken) return NextResponse.redirect(new URL('/home', req.url))
    return NextResponse.next()
  }

  // Protected pages → redirect if not logged in
  if (!hasToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
