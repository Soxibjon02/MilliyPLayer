'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import SongCard from '@/components/ui/SongCard'
import { Song, Category } from '@/lib/types'
import { Grid3X3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CategoriesPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/songs').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([s, c]) => {
      setSongs(s.songs ?? [])
      setCategories(c.categories ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = active ? songs.filter((s) => s.categoryIds?.includes(active)) : songs

  return (
    <AppLayout>
      <Header title="Kategoriyalar" />
      <main className="px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActive(null)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition',
              !active ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            Barchasi ({songs.length})
          </button>
          {categories.map((cat) => {
            const count = songs.filter((s) => s.categoryIds?.includes(cat.id)).length
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5',
                  active === cat.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {cat.name}
                <span className={cn('text-xs', active === cat.id ? 'text-white/70' : 'text-gray-400')}>{count}</span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Grid3X3 className="w-12 h-12 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400">Bu kategoriyada musiqa yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((song) => (
              <SongCard key={song.id} song={song} queue={filtered} categories={categories} />
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  )
}
