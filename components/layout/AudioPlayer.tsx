'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2, Maximize2, Minimize2 } from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { formatDuration } from '@/lib/utils'
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

  const [isFullscreen, setIsFullscreen] = useState(false)

  // Escape key to exit fullscreen mode
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  if (!currentSong) return null

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <>
      {/* Dynamic Fullscreen Player Backdrop and Interface */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-8 bg-[#0a0a14] text-white transition-all duration-500 animate-fade-in overflow-hidden">
          {/* Blurred Background Artwork */}
          <div className="absolute inset-0 select-none pointer-events-none scale-105 filter blur-3xl opacity-40 transition-all duration-1000">
            <Image
              src={currentSong.coverUrl}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Dark overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050c] via-[#05050c]/80 to-transparent pointer-events-none" />

          {/* Fullscreen Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Hozir ijroda
              </span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all border border-white/10"
              title="Kichraytirish (Esc)"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Fullscreen Body Content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 my-auto max-w-5xl mx-auto w-full">
            {/* Album Cover Art */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[380px] md:h-[380px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group transition-transform duration-700 hover:scale-[1.02]">
              <Image
                src={currentSong.coverUrl}
                alt={currentSong.title}
                fill
                className={cn("object-cover transition-transform duration-[10000ms] ease-linear", isPlaying && "scale-110")}
                priority
              />
            </div>

            {/* Song Info and Lyrics */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left min-w-0 max-w-xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 truncate w-full text-white">
                {currentSong.title}
              </h1>
              <p className="text-lg sm:text-xl text-[#009FE3] font-medium mb-8 truncate w-full">
                {currentSong.artist}
              </p>

              {/* Dynamic scrollable lyrics inside full screen */}
              <div className="w-full max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/5 text-left">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Mic2 className="w-3 h-3 text-[#009FE3]" /> Qo'shiq matni
                </p>
                <p className="text-sm sm:text-base text-white/90 whitespace-pre-line leading-relaxed italic">
                  {currentSong.lyrics || "Musiqa matni mavjud emas."}
                </p>
              </div>
            </div>
          </div>

          {/* Fullscreen Player Controls */}
          <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col gap-6 mb-4">
            {/* Timeline Progress */}
            <div className="flex flex-col gap-2">
              <div
                className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  seek((e.clientX - rect.left) / rect.width)
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#009FE3] to-[#00A550] rounded-full relative"
                  style={{ width: `${pct}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-white/60 font-medium tabular-nums">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-6">
              {/* Extra toggle */}
              <div className="w-32 flex items-center gap-4">
                <button
                  onClick={toggleLyrics}
                  className={cn("p-2 rounded-lg transition-colors", showLyrics ? "text-primary bg-white/10" : "text-white/60 hover:text-white")}
                  title="Qo'shiq matni paneli"
                >
                  <Mic2 className="w-5 h-5" />
                </button>
              </div>

              {/* Main Playback Controls */}
              <div className="flex items-center gap-6 sm:gap-8">
                <button
                  onClick={prev}
                  className="p-2 text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"
                  title="Oldingi"
                >
                  <SkipBack className="w-7 h-7" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 text-black fill-black" />
                  ) : (
                    <Play className="w-7 h-7 text-black fill-black ml-1" />
                  )}
                </button>
                <button
                  onClick={next}
                  className="p-2 text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"
                  title="Keyingi"
                >
                  <SkipForward className="w-7 h-7" />
                </button>
              </div>

              {/* Volume */}
              <div className="w-32 flex items-center gap-2 justify-end">
                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 accent-primary bg-white/20 h-1 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Cover Overlay for Sidebar/Layout */}
      {!isFullscreen && isPlaying && (
        <div className="fixed inset-0 -z-10 select-none pointer-events-none filter blur-[80px] opacity-10 transition-all duration-1000">
          <Image
            src={currentSong.coverUrl}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Lyrics panel (Non-fullscreen mode) */}
      {showLyrics && currentSong.lyrics && !isFullscreen && (
        <div className="fixed bottom-36 md:bottom-24 left-0 md:left-56 right-0 z-20 bg-white/95 dark:bg-black/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
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

      {/* Standard bottom Player bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-56 right-0 h-20 bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2 md:gap-4 z-30 shadow-lg md:shadow-none">
        {/* Song info */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-initial min-w-0">
          <div
            className="relative w-11 h-11 md:w-12 md:h-12 flex-shrink-0 rounded overflow-hidden cursor-pointer group"
            onClick={() => setIsFullscreen(true)}
            title="Kattalashtirish"
          >
            <Image
              src={currentSong.coverUrl}
              alt={currentSong.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="48px"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="min-w-0 cursor-pointer" onClick={() => setIsFullscreen(true)}>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:underline">{currentSong.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls - Main buttons */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center hover:scale-105 transition active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white dark:text-black" />
            ) : (
              <Play className="w-4 h-4 text-white dark:text-black ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Controls - Desktop detailed control area */}
        <div className="hidden md:flex flex-1 flex-col items-center gap-1.5">
          <div className="flex items-center gap-5">
            <button onClick={prev} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center hover:scale-105 transition animate-pulse-subtle"
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

        {/* Volume + Lyrics + Fullscreen (Desktop only) */}
        <div className="hidden md:flex items-center gap-3 w-48 justify-end">
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
            onClick={() => setIsFullscreen(true)}
            title="Kattalashtirish"
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
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
            className="w-16 accent-primary"
          />
        </div>
      </div>
    </>
  )
}
