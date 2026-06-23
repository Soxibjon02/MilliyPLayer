'use client'

import { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react'
import { Song } from '@/lib/types'

interface PlayerContextType {
  currentSong: Song | null
  queue: Song[]
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  showLyrics: boolean
  playSong: (song: Song, queue?: Song[]) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (pct: number) => void
  setVolume: (v: number) => void
  toggleLyrics: () => void
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType)

const PLAY_COUNT_DELAY = 15_000 // 15 seconds before counting

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const countedRef = useRef<Set<string>>(new Set())
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [showLyrics, setShowLyrics] = useState(false)

  // 1. Initial configuration on mount
  useEffect(() => {
    const audio = new Audio()
    // Load volume from local storage if exists
    const savedVol = localStorage.getItem('millyplayer_volume')
    const startVol = savedVol ? Number(savedVol) : 0.8
    audio.volume = startVol
    setVolumeState(startVol)
    audioRef.current = audio

    // Try to restore last state
    try {
      const savedSong = localStorage.getItem('millyplayer_currentSong')
      const savedQueue = localStorage.getItem('millyplayer_queue')
      const savedProgress = localStorage.getItem('millyplayer_progress')

      if (savedSong) {
        const songData = JSON.parse(savedSong) as Song
        setCurrentSong(songData)
        audio.src = songData.audioUrl
        
        if (savedProgress) {
          const time = Number(savedProgress)
          audio.currentTime = time
          setProgress(time)
        }
      }
      if (savedQueue) {
        setQueue(JSON.parse(savedQueue) as Song[])
      }
    } catch (e) {
      console.error('Failed to restore player state from localStorage', e)
    }

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime)
      // Save progress to local storage occasionally
      if (audio.currentTime > 0) {
        localStorage.setItem('millyplayer_progress', String(audio.currentTime))
      }
    })
    audio.addEventListener('durationchange', () => {
      setDuration(audio.duration)
    })
    audio.addEventListener('ended', () => {
      handleNext()
    })
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))

    return () => {
      audio.pause()
      audio.src = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startPlayCountTimer(songId: string) {
    if (playTimerRef.current) clearTimeout(playTimerRef.current)
    playTimerRef.current = setTimeout(() => {
      if (!countedRef.current.has(songId)) {
        countedRef.current.add(songId)
        fetch(`/api/songs/${songId}/play`, { method: 'POST' }).catch(() => {})
      }
    }, PLAY_COUNT_DELAY)
  }

  function playSong(song: Song, newQueue?: Song[]) {
    const audio = audioRef.current!
    if (playTimerRef.current) clearTimeout(playTimerRef.current)

    // Save state
    localStorage.setItem('millyplayer_currentSong', JSON.stringify(song))
    setCurrentSong(song)

    if (newQueue) {
      localStorage.setItem('millyplayer_queue', JSON.stringify(newQueue))
      setQueue(newQueue)
    }

    audio.src = song.audioUrl
    audio.play().catch(console.error)
    setProgress(0)
    localStorage.setItem('millyplayer_progress', '0')
    startPlayCountTimer(song.id)
  }

  function togglePlay() {
    const audio = audioRef.current!
    if (audio.paused) {
      audio.play().catch(console.error)
      if (currentSong) startPlayCountTimer(currentSong.id)
    } else {
      audio.pause()
      if (playTimerRef.current) clearTimeout(playTimerRef.current)
    }
  }

  function handleNext() {
    if (!currentSong || queue.length === 0) return
    const idx = queue.findIndex((s) => s.id === currentSong.id)
    const next = queue[(idx + 1) % queue.length]
    if (next) playSong(next, queue)
  }

  function handlePrev() {
    const audio = audioRef.current!
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    if (!currentSong || queue.length === 0) return
    const idx = queue.findIndex((s) => s.id === currentSong.id)
    const prev = queue[(idx - 1 + queue.length) % queue.length]
    if (prev) playSong(prev, queue)
  }

  function seek(pct: number) {
    const audio = audioRef.current!
    if (duration) {
      audio.currentTime = pct * duration
      setProgress(audio.currentTime)
      localStorage.setItem('millyplayer_progress', String(audio.currentTime))
    }
  }

  // Handle volume set and persist
  function setVolume(v: number) {
    const audio = audioRef.current!
    audio.volume = v
    setVolumeState(v)
  }

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        progress,
        duration,
        volume,
        showLyrics,
        playSong,
        togglePlay,
        next: handleNext,
        prev: handlePrev,
        seek,
        setVolume,
        toggleLyrics: () => setShowLyrics((p) => !p),
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)
