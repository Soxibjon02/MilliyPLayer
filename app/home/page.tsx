'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Clock, Music, Headphones } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import SongCard from '@/components/ui/SongCard'
import { Song, Category } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'

/* ── Uzbek 8-pointed star tile pattern ── */
function UzbekPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern id="star-tile" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            {/* Outer 8-pointed star */}
            <path
              d="M32,4 L37.7,26.3 L60,32 L37.7,37.7 L32,60 L26.3,37.7 L4,32 L26.3,26.3 Z"
              fill="none" stroke="white" strokeWidth="0.7" opacity="0.22"
            />
            {/* Inner octagon */}
            <path
              d="M32,16 L40,24 L48,32 L40,40 L32,48 L24,40 L16,32 L24,24 Z"
              fill="none" stroke="white" strokeWidth="0.4" opacity="0.13"
            />
            {/* Center diamond */}
            <path d="M32,27 L37,32 L32,37 L27,32 Z" fill="white" opacity="0.09" />
            {/* Corner dots */}
            <circle cx="0"  cy="0"  r="1.3" fill="white" opacity="0.18" />
            <circle cx="64" cy="0"  r="1.3" fill="white" opacity="0.18" />
            <circle cx="0"  cy="64" r="1.3" fill="white" opacity="0.18" />
            <circle cx="64" cy="64" r="1.3" fill="white" opacity="0.18" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#star-tile)" />
      </svg>
    </div>
  )
}

/* ── Uzbekistan flag colour stripe ── */
function FlagStripe({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-full ${className}`}
      style={{
        background:
          'linear-gradient(90deg,#009FE3 33.3%,#CE1126 33.3%,#CE1126 34.5%,#fff 34.5%,#fff 65.5%,#CE1126 65.5%,#CE1126 66.7%,#00A550 66.7%)',
      }}
    />
  )
}

/* ── Section heading with gradient underline ── */
function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-gray-900 dark:text-white text-xl tracking-tight">{label}</h3>
      </div>
      <div
        className="h-0.5 w-20 rounded-full"
        style={{ background: 'linear-gradient(90deg,#009FE3,#00A550)' }}
      />
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/songs').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([s, c]) => {
        setSongs(s.songs ?? [])
        setCategories(c.categories ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const trending = [...songs].sort((a, b) => b.playCount - a.playCount).slice(0, 10)
  const recent = [...songs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <AppLayout>
      <Header title="Bosh sahifa" />
      <main className="px-6 py-6 space-y-10">

        {/* ─── HERO BANNER ─── */}
        <div
          className="relative overflow-hidden rounded-2xl min-h-[200px] flex items-center"
          style={{ background: 'linear-gradient(135deg,#009FE3 0%,#0077B6 40%,#005C99 65%,#00A550 100%)' }}
        >
          <UzbekPattern />

          {/* Text side */}
          <div className="relative z-10 px-8 py-8 flex-1">
            {user ? (
              <>
                <p className="text-white/65 text-xs font-medium tracking-widest uppercase mb-2">
                  {user.role === 'admin' ? '★ Administrator' : '♪ Foydalanuvchi'}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight">
                  Xush kelibsiz, {user.name}!
                </h2>
                <p className="text-white/60 text-sm">Bugun qanday musiqa tinglaysiz?</p>
              </>
            ) : (
              <>
                <p className="text-white/65 text-xs font-medium tracking-widest uppercase mb-2">
                  ♪ O'zbek milliy musiqasi
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                  MilliyPlayer'ga<br className="hidden sm:block" />xush kelibsiz!
                </h2>
                <p className="text-white/60 text-sm mb-5">
                  Sevimli musiqalaringizni saqlash uchun hisob oching
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="px-5 py-2 rounded-lg bg-white text-primary font-semibold text-sm hover:bg-white/90 transition shadow"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 rounded-lg bg-white/15 text-white font-semibold text-sm hover:bg-white/25 transition border border-white/30"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              </>
            )}
            <FlagStripe className="h-1 w-40 mt-6" />
          </div>

          {/* Right: decorative */}
          <div className="relative z-10 hidden lg:flex items-center justify-center pr-12 opacity-[0.12]">
            <Headphones className="w-36 h-36 text-white" />
          </div>
        </div>

        {/* ─── STATS ROW ─── */}
        {!loading && songs.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: songs.length, label: 'Jami musiqa', color: '#009FE3' },
              { value: categories.length, label: 'Kategoriya', color: '#00A550' },
              { value: (trending[0]?.playCount ?? 0).toLocaleString(), label: 'Top tinglanish', color: '#CE1126' },
            ].map(({ value, label, color }) => (
              <div
                key={label}
                className="rounded-xl p-4 border"
                style={{
                  background: `linear-gradient(135deg, ${color}18, ${color}08)`,
                  borderColor: `${color}30`,
                }}
              >
                <p className="text-2xl font-bold truncate" style={{ color }}>{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── SONGS ─── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : songs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg,#009FE3,#00A550)' }}
            >
              <Music className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                Hali musiqa qo'shilmagan
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Admin yangi musiqalar qo'shgandan keyin bu yerda ko'rinadi
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Trending */}
            <section>
              <SectionTitle icon={TrendingUp} label="Ommabop Musiqalar" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {trending.map((song) => (
                  <SongCard key={song.id} song={song} queue={trending} categories={categories} />
                ))}
              </div>
            </section>

            {/* Recently added */}
            <section>
              <SectionTitle icon={Clock} label="Yangi Qo'shilganlar" />
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
