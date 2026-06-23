'use client'

import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2 } from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration, formatPlayCount } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    showLyrics,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleLyrics,
  } = usePlayer()

  if (!currentSong) return null

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <>
      {/* Lyrics panel */}
      {showLyrics && currentSong.lyrics && (
        <div className="fixed bottom-24 left-56 right-0 z-20 bg-white/95 dark:bg-black/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <p className="text-sm font-semibold text-primary mb-2">
              {currentSong.title} — {currentSong.artist}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {currentSong.lyrics}
            </p>
          </div>
        </div>
      )}

      {/* Player bar */}
      <div className="fixed bottom-0 left-56 right-0 h-20 bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-gray-800 flex items-center px-4 gap-4 z-30">
        {/* Song info */}
        <div className="flex items-center gap-3 w-56 min-w-0">
          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={currentSong.coverUrl}
              alt={currentSong.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentSong.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-5">
            <button onClick={prev} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center hover:scale-105 transition"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white dark:text-black" />
              ) : (
                <Play className="w-4 h-4 text-white dark:text-black ml-0.5" />
              )}
            </button>
            <button onClick={next} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 w-full max-w-lg">
            <span className="text-xs text-gray-400 tabular-nums w-9 text-right">{formatDuration(progress)}</span>
            <div
              className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                seek((e.clientX - rect.left) / rect.width)
              }}
            >
              <div
                className="h-full bg-primary rounded-full relative"
                style={{ width: `${pct}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <span className="text-xs text-gray-400 tabular-nums w-9">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume + Lyrics */}
        <div className="flex items-center gap-3 w-40 justify-end">
          {currentSong.lyrics && (
            <button
              onClick={toggleLyrics}
              title="Lyrics"
              className={cn(
                'transition',
                showLyrics ? 'text-primary' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Mic2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-primary"
          />
        </div>
      </div>
    </>
  )
}
