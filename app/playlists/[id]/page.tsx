'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import SongCard from '@/components/ui/SongCard'
import { Playlist, Song, Category } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, updatePlaylists } = useAuth()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const pl = user.playlists?.find((p) => p.id === id) ?? null
    setPlaylist(pl)
    setEditName(pl?.name ?? '')

    Promise.all([
      fetch('/api/songs').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([s, c]) => {
      setSongs(s.songs ?? [])
      setCategories(c.categories ?? [])
    }).finally(() => setLoading(false))
  }, [id, user])

  async function saveName() {
    if (!editName.trim() || !playlist) return
    setSaving(true)
    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (res.ok) {
        const updated = { ...playlist, name: editName.trim() }
        setPlaylist(updated)
        const newPlaylists = (user?.playlists ?? []).map((p) => (p.id === id ? updated : p))
        updatePlaylists(newPlaylists)
      }
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  async function deletePlaylist() {
    if (!confirm(`"${playlist?.name}" playlistini o'chirasizmi?`)) return
    await fetch(`/api/playlists/${id}`, { method: 'DELETE' })
    const newPlaylists = (user?.playlists ?? []).filter((p) => p.id !== id)
    updatePlaylists(newPlaylists)
    router.push('/playlists')
  }

  async function removeSong(songId: string) {
    if (!playlist) return
    setRemovingId(songId)
    try {
      const res = await fetch(`/api/playlists/${id}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, action: 'remove' }),
      })
      if (res.ok) {
        const data = await res.json()
        setPlaylist(data.playlist)
        const newPlaylists = (user?.playlists ?? []).map((p) => (p.id === id ? data.playlist : p))
        updatePlaylists(newPlaylists)
      }
    } finally {
      setRemovingId(null)
    }
  }

  const playlistSongs = songs.filter((s) => playlist?.songIds.includes(s.id))

  if (!loading && !playlist) {
    return (
      <AppLayout requireAuth>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500 dark:text-gray-400">Playlist topilmadi</p>
          <button onClick={() => router.push('/playlists')} className="text-primary text-sm hover:underline">
            Playlistlarga qaytish
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout requireAuth>
      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push('/playlists')}
            className="mt-0.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  autoFocus
                  className="flex-1 px-3 py-1.5 rounded-lg border border-primary bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:outline-none"
                />
                <button onClick={saveName} disabled={saving} className="p-1.5 text-primary hover:opacity-80 transition">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
                <button onClick={() => setEditing(false)} className="p-1.5 text-gray-400 hover:text-gray-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {playlist?.name ?? '...'}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 text-gray-400 hover:text-primary transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-400 mt-0.5">
              {playlist?.songIds.length ?? 0} ta musiqa
            </p>
          </div>
          <button
            onClick={deletePlaylist}
            className="mt-0.5 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Songs */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : playlistSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Bu playlist bo'sh</p>
            <p className="text-sm text-gray-400">
              Musiqa kartasidagi <span className="text-primary">+</span> tugmasini bosib qo'shing
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlistSongs.map((song) => (
              <div key={song.id} className="relative group">
                <SongCard song={song} queue={playlistSongs} categories={categories} />
                <button
                  onClick={() => removeSong(song.id)}
                  disabled={removingId === song.id}
                  className={cn(
                    'absolute top-2 left-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600',
                  )}
                >
                  {removingId === song.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
