'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import { Music, Grid3X3, TrendingUp, Settings, Loader2 } from 'lucide-react'
import { Song, Category } from '@/lib/types'
import { FooterSettings } from '@/lib/footerTypes'
import { formatPlayCount } from '@/lib/utils'
import Image from 'next/image'

export default function AdminDashboard() {
  const [songs, setSongs] = useState<Song[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Footer Settings form state
  const [footerEmail, setFooterEmail] = useState('')
  const [footerDevName, setFooterDevName] = useState('')
  const [footerDevRole, setFooterDevRole] = useState('')
  const [footerDesc, setFooterDesc] = useState('')
  const [footerStack, setFooterStack] = useState('')
  const [savingFooter, setSavingFooter] = useState(false)
  const [footerStatus, setFooterStatus] = useState({ type: '', msg: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/songs').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/admin/footer').then((r) => r.json()),
    ]).then(([s, c, f]) => {
      setSongs(s.songs ?? [])
      setCategories(c.categories ?? [])
      if (f.settings) {
        const settings: FooterSettings = f.settings
        setFooterEmail(settings.email)
        setFooterDevName(settings.developerName)
        setFooterDevRole(settings.developerRole)
        setFooterDesc(settings.description)
        setFooterStack(settings.techStack)
      }
    }).finally(() => setLoading(false))
  }, [])

  const totalPlays = songs.reduce((acc, s) => acc + (s.playCount ?? 0), 0)
  const topSongs = [...songs].sort((a, b) => b.playCount - a.playCount).slice(0, 5)

  async function handleSaveFooter(e: React.FormEvent) {
    e.preventDefault()
    setSavingFooter(true)
    setFooterStatus({ type: '', msg: '' })
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: footerEmail,
          developerName: footerDevName,
          developerRole: footerDevRole,
          description: footerDesc,
          techStack: footerStack,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFooterStatus({ type: 'error', msg: data.error ?? 'Saqlashda xatolik yuz berdi' })
      } else {
        setFooterStatus({ type: 'success', msg: "Footer sozlamalari muvaffaqiyatli saqlandi!" })
      }
    } catch {
      setFooterStatus({ type: 'error', msg: 'Server bilan bog\'lanishda xatolik' })
    } finally {
      setSavingFooter(false)
    }
  }

  const stats = [
    { label: "Jami musiqalar", value: songs.length, icon: Music, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: "Kategoriyalar", value: categories.length, icon: Grid3X3, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: "Jami tinglashlar", value: formatPlayCount(totalPlays), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ]

  return (
    <AppLayout adminOnly>
      <Header title="Admin Dashboard" />
      <main className="px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Songs */}
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Top musiqalar</h3>
                </div>
                {topSongs.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Hali musiqa qo'shilmagan
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {topSongs.map((song, i) => (
                      <div key={song.id} className="px-5 py-3 flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={song.coverUrl} alt={song.title} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{song.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{formatPlayCount(song.playCount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer configuration */}
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <Settings className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Footer Sozlamalari</h3>
                </div>

                <form onSubmit={handleSaveFooter} className="space-y-4">
                  {footerStatus.msg && (
                    <div className={`p-3 rounded-lg text-xs font-medium ${footerStatus.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {footerStatus.msg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dasturchi ismi</label>
                      <input
                        value={footerDevName}
                        onChange={(e) => setFooterDevName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dasturchi roli</label>
                      <input
                        value={footerDevRole}
                        onChange={(e) => setFooterDevRole(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Aloqa E-maili</label>
                    <input
                      type="email"
                      value={footerEmail}
                      onChange={(e) => setFooterEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Footer Ta'rifi</label>
                    <textarea
                      value={footerDesc}
                      onChange={(e) => setFooterDesc(e.target.value)}
                      rows={2}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Texnologiyalar</label>
                    <input
                      value={footerStack}
                      onChange={(e) => setFooterStack(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingFooter}
                    className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {savingFooter && <Loader2 className="w-4 h-4 animate-spin" />}
                    Saqlash
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </AppLayout>
  )
}
