'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Heart, ListPlus } from 'lucide-react'
import { Song, Category } from '@/lib/types'
import { usePlayer } from '@/context/PlayerContext'
import { useAuth } from '@/context/AuthContext'
import { formatPlayCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import AddToPlaylistModal from './AddToPlaylistModal'

interface SongCardProps {
  song: Song
  queue: Song[]
  categories: Category[]
  onDelete?: (id: string) => void
  onEdit?: (song: Song) => void
  isAdmin?: boolean
}

export default function SongCard({ song, queue, categories, onDelete, onEdit, isAdmin }: SongCardProps) {
  const { playSong, currentSong, isPlaying } = usePlayer()
  const { user, updateFavorites } = useAuth()
  const [playlistOpen, setPlaylistOpen] = useState(false)

  const isCurrent = currentSong?.id === song.id
  const isFavorite = user?.favorites?.includes(song.id)
  const songCategories = categories.filter((c) => song.categoryIds?.includes(c.id))

  async function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    if (!user) return
    const action = isFavorite ? 'remove' : 'add'
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: song.id, action }),
    })
    if (res.ok) {
      const data = await res.json()
      updateFavorites(data.favorites)
    }
  }

  function handlePlaylist(e: React.MouseEvent) {
    e.stopPropagation()
    setPlaylistOpen(true)
  }

  return (
    <>
      <div
        className={cn(
          'group relative bg-card-DEFAULT dark:bg-card-dark rounded-xl overflow-hidden cursor-pointer transition hover:scale-[1.02] hover:shadow-lg',
          isCurrent && 'ring-2 ring-primary'
        )}
        onClick={() => playSong(song, queue)}
      >
        {/* Cover */}
        <div className="relative aspect-square">
          <Image
            src={song.coverUrl}
            alt={song.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
          {/* Play overlay */}
          <div className={cn(
            'absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity',
            isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}>
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl">
              <Play className="w-5 h-5 text-white ml-1" />
            </div>
          </div>

          {/* Action icons on hover */}
          {user && (
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={handleFavorite}
                className="p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition"
              >
                {isFavorite ? (
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                ) : (
                  <Heart className="w-4 h-4 text-white" />
                )}
              </button>
              {user.role !== 'admin' && (
                <button
                  onClick={handlePlaylist}
                  className="p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition"
                >
                  <ListPlus className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className={cn('font-semibold text-sm truncate', isCurrent ? 'text-primary' : 'text-gray-900 dark:text-white')}>
            {song.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
          {songCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {songCategories.slice(0, 2).map((c) => (
                <span key={c.id} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {c.name}
                </span>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-1.5">{formatPlayCount(song.playCount)} marta tinglangan</p>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(song) }}
                className="p-1.5 bg-gray-900/80 hover:bg-gray-700 rounded text-xs text-white"
              >
                Tahrirlash
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(song.id) }}
                className="p-1.5 bg-red-600/80 hover:bg-red-500 rounded text-xs text-white"
              >
                O'chirish
              </button>
            )}
          </div>
        )}
      </div>

      {playlistOpen && (
        <AddToPlaylistModal song={song} onClose={() => setPlaylistOpen(false)} />
      )}
    </>
  )
}
