'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import SongCard from '@/components/ui/SongCard'
import SongModal from '@/components/ui/SongModal'
import { Song, Category } from '@/lib/types'
import { Plus, Music } from 'lucide-react'

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/songs').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([s, c]) => {
      setSongs(s.songs ?? [])
      setCategories(c.categories ?? [])
    }).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Bu musiqani o\'chirishni tasdiqlaysizmi?')) return
    await fetch(`/api/songs/${id}`, { method: 'DELETE' })
    setSongs((prev) => prev.filter((s) => s.id !== id))
  }

  function handleSaved(song: Song) {
    setSongs((prev) => {
      const idx = prev.findIndex((s) => s.id === song.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = song
        return updated
      }
      return [song, ...prev]
    })
    setModalOpen(false)
  }

  return (
    <AppLayout adminOnly>
      <Header title="Musiqalar boshqaruvi" />
      <main className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{songs.length} ta musiqa</p>
          <button
            onClick={() => { setEditingSong(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Musiqa qo'shish
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Music className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Musiqa qo'shing</p>
            <button
              onClick={() => { setEditingSong(null); setModalOpen(true) }}
              className="text-primary text-sm font-medium hover:underline"
            >
              Birinchi musiqani qo'shish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                queue={songs}
                categories={categories}
                isAdmin
                onEdit={(s) => { setEditingSong(s); setModalOpen(true) }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <SongModal
          song={editingSong}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </AppLayout>
  )
}
