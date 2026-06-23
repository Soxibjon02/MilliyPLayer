export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: string
  favorites: string[] // song ids
}

export interface Song {
  id: string
  title: string
  artist: string
  categoryIds: string[]
  coverUrl: string
  audioUrl: string
  lyrics: string
  playCount: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface DBData {
  users: User[]
  songs: Song[]
  categories: Category[]
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  favorites: string[]
}
