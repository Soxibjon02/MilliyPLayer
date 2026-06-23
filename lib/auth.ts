import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWTPayload, AuthUser, User } from './types'

const JWT_SECRET = process.env.JWT_SECRET!
export const COOKIE_NAME = 'millyplayer_token'

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// For use in API route handlers (Server Components context)
// Supports both httpOnly cookie (web) and Authorization: Bearer (mobile)
export async function getCurrentUserFromRequest(): Promise<JWTPayload | null> {
  const { cookies, headers } = await import('next/headers')

  // Bearer token takes priority (React Native mobile app)
  const authHeader = headers().get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.slice(7))
  }

  // Fall back to cookie (web)
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function userToAuth(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    favorites: user.favorites ?? [],
    playlists: user.playlists ?? [],
  }
}
