'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2, Maximize2, Minimize2 } from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function AudioPlayer() {
  const {
    currentSong, isPlaying, progress, duration, volume,
    showLyrics, togglePlay, next, prev, seek, setVolume, toggleLyrics,
  } = usePlayer()

  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  if (!currentSong) return null

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <>
      {/* ─── FULLSCREEN PLAYER ─── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a14] text-white overflow-hidden">
          {/* Blurred background */}
          <div className="absolute inset-0 scale-110 filter blur-3xl opacity-35 pointer-events-none select-none">
            <Image src={currentSong.coverUrl} alt="" fill className="object-cover" priority />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050c] via-[#05050c]/75 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2 sm:px-8 sm:pt-6">
            <span className="bg-primary/20 text-primary text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Hozir ijroda
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 sm:p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition border border-white/10"
            >
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Body — flex-1 so controls stay anchored at bottom */}
          <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-16 px-4 sm:px-8 min-h-0 overflow-hidden py-2">
            {/* Cover — small on mobile, large on desktop */}
            <div className={cn(
              'relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 transition-transform duration-700',
              'w-36 h-36 sm:w-56 sm:h-56 lg:w-[340px] lg:h-[340px]',
              isPlaying && 'scale-[1.02]'
            )}>
              <Image src={currentSong.coverUrl} alt={currentSong.title} fill className="object-cover" priority />
            </div>

            {/* Song info + Lyrics */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left min-w-0 min-h-0 max-w-xl w-full">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-1 truncate w-full text-white">
                {currentSong.title}
              </h1>
              <p className="text-sm sm:text-lg text-[#009FE3] font-medium mb-3 sm:mb-6 truncate w-full">
                {currentSong.artist}
              </p>

              {/* Lyrics — takes remaining space, larger on mobile */}
              <div className="w-full overflow-y-auto bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/5 text-left flex-1 min-h-0 max-h-[28vh] sm:max-h-[35vh] lg:max-h-72">
                <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-2">
                  <Mic2 className="w-3 h-3 text-[#009FE3]" /> Qo'shiq matni
                </p>
                <p className="text-xs sm:text-sm text-white/85 whitespace-pre-line leading-relaxed italic">
                  {currentSong.lyrics || "Musiqa matni mavjud emas."}
                </p>
              </div>
            </div>
          </div>

          {/* Controls — always visible at bottom, respects iPhone safe area */}
          <div
            className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-8 pb-4 sm:pb-6 flex flex-col gap-3 sm:gap-5"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
          >
            {/* Progress bar */}
            <div>
              <div
                className="w-full h-1 sm:h-1.5 bg-white/15 rounded-full cursor-pointer group relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  seek((e.clientX - rect.left) / rect.width)
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#009FE3] to-[#00A550] rounded-full relative"
                  style={{ width: `${pct}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-white/50 font-medium tabular-nums mt-1">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between">
              {/* Lyrics toggle */}
              <button
                onClick={toggleLyrics}
                className={cn('p-2 rounded-lg transition-colors', showLyrics ? 'text-primary bg-white/10' : 'text-white/50 hover:text-white')}
              >
                <Mic2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Prev / Play / Next */}
              <div className="flex items-center gap-5 sm:gap-8">
                <button onClick={prev} className="p-2 text-white/60 hover:text-white hover:scale-110 transition">
                  <SkipBack className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-2xl transition"
                >
                  {isPlaying
                    ? <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-black" />
                    : <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-1" />
                  }
                </button>
                <button onClick={next} className="p-2 text-white/60 hover:text-white hover:scale-110 transition">
                  <SkipForward className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              </div>

              {/* Volume (hidden on xs, visible sm+) */}
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} className="text-white/50 hover:text-white transition">
                  {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range" min={0} max={1} step={0.01} value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 accent-primary h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Volume mute (xs only) */}
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                className="sm:hidden p-2 text-white/50 hover:text-white transition"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background cover blur (non-fullscreen) */}
      {!isFullscreen && isPlaying && (
        <div className="fixed inset-0 -z-10 select-none pointer-events-none filter blur-[80px] opacity-10 transition-all duration-1000">
          <Image src={currentSong.coverUrl} alt="" fill className="object-cover" />
        </div>
      )}

      {/* Lyrics panel (non-fullscreen) */}
      {showLyrics && currentSong.lyrics && !isFullscreen && (
        <div className="fixed bottom-20 left-0 md:left-56 right-0 z-20 bg-white/95 dark:bg-black/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 max-h-56 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 py-3">
            <p className="text-sm font-semibold text-primary mb-1.5">{currentSong.title} — {currentSong.artist}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {currentSong.lyrics}
            </p>
          </div>
        </div>
      )}

      {/* ─── MINI PLAYER BAR ─── */}
      <div
        className="fixed bottom-0 left-0 md:left-56 right-0 z-30 bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-gray-800 shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="h-16 sm:h-20 flex items-center px-3 md:px-4 gap-2 md:gap-4">
          {/* Cover + song info */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-initial min-w-0">
            <div
              className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded overflow-hidden cursor-pointer group"
              onClick={() => setIsFullscreen(true)}
            >
              <Image
                src={currentSong.coverUrl} alt={currentSong.title} fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="48px"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="min-w-0 cursor-pointer" onClick={() => setIsFullscreen(true)}>
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{currentSong.title}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Mobile controls: prev + play + next */}
          <div className="flex items-center gap-1 md:hidden">
            <button onClick={prev} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center hover:scale-105 transition active:scale-95"
            >
              {isPlaying
                ? <Pause className="w-4 h-4 text-white dark:text-black" />
                : <Play className="w-4 h-4 text-white dark:text-black ml-0.5" />
              }
            </button>
            <button onClick={next} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={() => setIsFullscreen(true)} className="p-2 text-gray-400 dark:text-gray-500">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop controls */}
          <div className="hidden md:flex flex-1 flex-col items-center gap-1">
            <div className="flex items-center gap-5">
              <button onClick={prev} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center hover:scale-105 transition"
              >
                {isPlaying
                  ? <Pause className="w-4 h-4 text-white dark:text-black" />
                  : <Play className="w-4 h-4 text-white dark:text-black ml-0.5" />
                }
              </button>
              <button onClick={next} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-lg">
              <span className="text-xs text-gray-400 tabular-nums w-9 text-right">{formatDuration(progress)}</span>
              <div
                className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  seek((e.clientX - rect.left) / rect.width)
                }}
              >
                <div className="h-full bg-primary rounded-full relative" style={{ width: `${pct}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
              <span className="text-xs text-gray-400 tabular-nums w-9">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Volume + extras (desktop) */}
          <div className="hidden md:flex items-center gap-3 w-48 justify-end">
            {currentSong.lyrics && (
              <button
                onClick={toggleLyrics}
                className={cn('transition', showLyrics ? 'text-primary' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white')}
              >
                <Mic2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setIsFullscreen(true)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range" min={0} max={1} step={0.01} value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 accent-primary"
            />
          </div>
        </div>
      </div>
    </>
  )
}
