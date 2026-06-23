'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, Playlist } from '@/lib/types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string; role?: string }>
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  updateFavorites: (favorites: string[]) => void
  updatePlaylists: (playlists: Playlist[]) => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        // Race condition fix: if login/register already ran and set user,
        // only overwrite if /api/auth/me found a valid session.
        // This prevents a slow /api/auth/me call from nullifying a fresh register/login.
        setUser((prev) => {
          if (d.user) return d.user   // server has a session → use authoritative value
          if (prev !== null) return prev  // login/register already set user → keep it
          return null
        })
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    setUser(data.user)
    setLoading(false)
    return { role: data.user?.role as string | undefined }
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    setUser(data.user)
    setLoading(false)
    return {}
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  function updateFavorites(favorites: string[]) {
    if (user) setUser({ ...user, favorites })
  }

  function updatePlaylists(playlists: Playlist[]) {
    if (user) setUser({ ...user, playlists })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateFavorites, updatePlaylists }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
