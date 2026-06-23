'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import SongCard from '@/components/ui/SongCard'
import { Song, Category } from '@/lib/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/songs').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([s, c]) => {
      setAllSongs(s.songs ?? [])
      setSongs(s.songs ?? [])
      setCategories(c.categories ?? [])
    })
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSongs(allSongs)
      return
    }
    const q = query.toLowerCase()
    setSongs(
      allSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          categories.filter((c) => s.categoryIds?.includes(c.id)).some((c) => c.name.toLowerCase().includes(q))
      )
    )
  }, [query, allSongs, categories])

  return (
    <AppLayout>
      <Header title="Qidirish" />
      <main className="px-6 py-6">
        <div className="relative max-w-lg mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Musiqa, ijrochi yoki kategoriya bo'yicha qidiring..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {query && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{songs.length} ta natija</p>
        )}

        {songs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} queue={songs} categories={categories} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Search className="w-12 h-12 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400">
              {query ? 'Hech narsa topilmadi' : 'Qidirish uchun yozing...'}
            </p>
          </div>
        )}
      </main>
    </AppLayout>
  )
}
