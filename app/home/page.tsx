'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import SongCard from '@/components/ui/SongCard'
import { Song, Category } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { TrendingUp, Clock, Music } from 'lucide-react'

export default function HomePage() {
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

  const trending = [...songs].sort((a, b) => b.playCount - a.playCount).slice(0, 10)
  const recent = [...songs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Header title="Bosh sahifa" />
      <main className="px-6 py-6 space-y-8">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white">
          {user ? (
            <>
              <h2 className="text-xl font-bold mb-1">Xush kelibsiz, {user.name}!</h2>
              <p className="text-white/70 text-sm">Bugun qanday musiqa tinglaysiz?</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">MilliyPlayer'ga xush kelibsiz!</h2>
              <p className="text-white/70 text-sm">
                Sevimli musiqalaringizni saqlash uchun{' '}
                <a href="/login" className="underline font-semibold hover:text-white/90 transition">
                  kiring
                </a>
                {' '}yoki{' '}
                <a href="/register" className="underline font-semibold hover:text-white/90 transition">
                  ro'yxatdan o'ting
                </a>
              </p>
            </>
          )}
        </div>

        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Music className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Hali musiqa qo'shilmagan</p>
            <p className="text-sm text-gray-400">Admin yangi musiqalar qo'shgandan keyin bu yerda ko'rinadi</p>
          </div>
        ) : (
          <>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Ommabop</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {trending.map((song) => (
                  <SongCard key={song.id} song={song} queue={trending} categories={categories} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Yangi qo'shilganlar</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recent.map((song) => (
                  <SongCard key={song.id} song={song} queue={recent} categories={categories} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </AppLayout>
  )
}
