'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ListPlus, Music, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import { Playlist } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'

export default function PlaylistsPage() {
  const { user, updatePlaylists } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>(user?.playlists ?? [])

  // Sync when user.playlists loads from /api/auth/me
  useEffect(() => {
    if (user?.playlists) setPlaylists(user.playlists)
  }, [user?.playlists])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function createPlaylist(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Xato'); return }
      const updated = [...playlists, data.playlist]
      setPlaylists(updated)
      updatePlaylists(updated)
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  async function deletePlaylist(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const updated = playlists.filter((p) => p.id !== id)
        setPlaylists(updated)
        updatePlaylists(updated)
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppLayout requireAuth>
      <Header title="Playlistlar" />
      <main className="px-6 py-6 space-y-6">

        {/* Create form */}
        <form onSubmit={createPlaylist} className="flex gap-2 max-w-md">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Yangi playlist nomi..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newName.trim() || creating}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-primary-dark transition flex items-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Yaratish
          </button>
        </form>
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Playlists grid */}
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg,#009FE3,#00A550)' }}
            >
              <ListPlus className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700 dark:text-gray-300 text-lg">
                Hali playlist yo'q
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Yuqoridagi forma orqali yangi playlist yarating
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="group relative bg-card-DEFAULT dark:bg-card-dark rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition"
              >
                <Link href={`/playlists/${pl.id}`} className="block p-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(135deg,#009FE3,#00A550)' }}
                  >
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{pl.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{pl.songIds.length} ta musiqa</p>
                </Link>
                <button
                  onClick={() => deletePlaylist(pl.id)}
                  disabled={deletingId === pl.id}
                  className="absolute top-2 right-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 text-gray-400"
                >
                  {deletingId === pl.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  )
}
