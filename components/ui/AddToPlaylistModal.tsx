'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Check, Loader2, ListMusic } from 'lucide-react'
import { Playlist, Song } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface AddToPlaylistModalProps {
  song: Song
  onClose: () => void
}

export default function AddToPlaylistModal({ song, onClose }: AddToPlaylistModalProps) {
  const { user, updatePlaylists } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>(user?.playlists ?? [])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.playlists) setPlaylists(user.playlists)
  }, [user?.playlists])

  async function togglePlaylist(playlist: Playlist) {
    const hasSong = playlist.songIds.includes(song.id)
    setLoadingId(playlist.id)
    try {
      const res = await fetch(`/api/playlists/${playlist.id}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: song.id, action: hasSong ? 'remove' : 'add' }),
      })
      if (res.ok) {
        const data = await res.json()
        const updated = playlists.map((p) => (p.id === playlist.id ? data.playlist : p))
        setPlaylists(updated)
        updatePlaylists(updated)
      }
    } finally {
      setLoadingId(null)
    }
  }

  async function createAndAdd() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) return
      const { playlist } = await res.json()

      // Add song to the new playlist
      const addRes = await fetch(`/api/playlists/${playlist.id}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: song.id, action: 'add' }),
      })
      const addData = addRes.ok ? await addRes.json() : null

      const finalPlaylist = addData?.playlist ?? { ...playlist, songIds: [song.id] }
      const updated = [...playlists, finalPlaylist]
      setPlaylists(updated)
      updatePlaylists(updated)
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1a1a2a] rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Playlistga qo'shish</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 truncate">
            <span className="font-medium text-gray-600 dark:text-gray-300">{song.title}</span> — {song.artist}
          </p>

          {playlists.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Hali playlist yo'q</p>
          ) : (
            <ul className="space-y-1 max-h-52 overflow-y-auto mb-3">
              {playlists.map((pl) => {
                const has = pl.songIds.includes(song.id)
                const busy = loadingId === pl.id
                return (
                  <li key={pl.id}>
                    <button
                      onClick={() => togglePlaylist(pl)}
                      disabled={busy}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition',
                        has
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <span className="truncate">{pl.name}</span>
                      <span className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-xs text-gray-400">{pl.songIds.length} ta</span>
                        {busy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : has ? (
                          <Check className="w-4 h-4" />
                        ) : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="flex gap-2 mt-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
              placeholder="Yangi playlist nomi..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={createAndAdd}
              disabled={!newName.trim() || creating}
              className="px-3 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50 hover:bg-primary-dark transition flex items-center gap-1"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
