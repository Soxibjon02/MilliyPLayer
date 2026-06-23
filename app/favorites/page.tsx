'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import SongCard from '@/components/ui/SongCard'
import { Song, Category } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const [categories, setCategories] = useState<Category[]>([])
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

  const favorites = songs.filter((s) => user?.favorites?.includes(s.id))

  return (
    <AppLayout>
      <Header title="Sevimlilar" />
      <main className="px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-red-400 fill-red-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{favorites.length} ta sevimli musiqa</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Sevimlilar ro'yxati bo'sh</p>
            <p className="text-sm text-gray-400">Musiqa kartasidagi yurak belgisini bosing</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map((song) => (
              <SongCard key={song.id} song={song} queue={favorites} categories={categories} />
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  )
}
