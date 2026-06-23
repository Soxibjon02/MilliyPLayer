'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import SongCard from '@/components/ui/SongCard'
import SongModal from '@/components/ui/SongModal'
import { Song, Category } from '@/lib/types'
import { Plus, Music, Search, X } from 'lucide-react'

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [query, setQuery] = useState('')

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

  const filtered = query.trim()
    ? songs.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
      )
    : songs

  return (
    <AppLayout adminOnly>
      <Header title="Musiqalar boshqaruvi" />
      <main className="px-6 py-6">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nomi yoki ijrochi..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {query ? `${filtered.length} / ${songs.length} ta` : `${songs.length} ta musiqa`}
          </p>

          <button
            onClick={() => { setEditingSong(null); setModalOpen(true) }}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Musiqa qo'shish
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 && query ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Search className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              "{query}" bo'yicha hech narsa topilmadi
            </p>
            <button onClick={() => setQuery('')} className="text-primary text-sm hover:underline">
              Qidiruvni tozalash
            </button>
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
            {filtered.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                queue={filtered}
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
