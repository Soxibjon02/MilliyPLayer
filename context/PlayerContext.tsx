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

const PLAY_COUNT_DELAY = 15_000

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const countedRef = useRef<Set<string>>(new Set())
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refs that stay current inside stale event-listener closures
  const currentSongRef = useRef<Song | null>(null)
  const queueRef = useRef<Song[]>([])

  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [showLyrics, setShowLyrics] = useState(false)

  // Keep refs in sync so event listeners always see latest values
  useEffect(() => { currentSongRef.current = currentSong }, [currentSong])
  useEffect(() => { queueRef.current = queue }, [queue])

  useEffect(() => {
    const audio = new Audio()
    const savedVol = localStorage.getItem('millyplayer_volume')
    const startVol = savedVol ? Number(savedVol) : 0.8
    audio.volume = startVol
    setVolumeState(startVol)
    audioRef.current = audio

    try {
      const savedSong = localStorage.getItem('millyplayer_currentSong')
      const savedQueue = localStorage.getItem('millyplayer_queue')
      const savedProgress = localStorage.getItem('millyplayer_progress')

      if (savedSong) {
        const songData = JSON.parse(savedSong) as Song
        setCurrentSong(songData)
        currentSongRef.current = songData
        audio.src = songData.audioUrl
        if (savedProgress) {
          const time = Number(savedProgress)
          audio.currentTime = time
          setProgress(time)
        }
      }
      if (savedQueue) {
        const q = JSON.parse(savedQueue) as Song[]
        setQueue(q)
        queueRef.current = q
      }
    } catch (e) {
      console.error('Failed to restore player state', e)
    }

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime)
      if (audio.currentTime > 0) {
        localStorage.setItem('millyplayer_progress', String(audio.currentTime))
      }
    })
    audio.addEventListener('durationchange', () => setDuration(audio.duration))
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))

    // Auto-play next — uses refs to avoid stale closure problem
    audio.addEventListener('ended', () => {
      const song = currentSongRef.current
      const q = queueRef.current
      if (!song || q.length === 0) return
      const idx = q.findIndex((s) => s.id === song.id)
      const nextSong = q[(idx + 1) % q.length]
      if (!nextSong) return

      audio.src = nextSong.audioUrl
      audio.play().catch(console.error)
      setCurrentSong(nextSong)
      currentSongRef.current = nextSong
      setProgress(0)
      localStorage.setItem('millyplayer_currentSong', JSON.stringify(nextSong))
      localStorage.setItem('millyplayer_progress', '0')

      // Play count for auto-played song
      if (!countedRef.current.has(nextSong.id)) {
        if (playTimerRef.current) clearTimeout(playTimerRef.current)
        playTimerRef.current = setTimeout(() => {
          if (!countedRef.current.has(nextSong.id)) {
            countedRef.current.add(nextSong.id)
            fetch(`/api/songs/${nextSong.id}/play`, { method: 'POST' }).catch(() => {})
          }
        }, PLAY_COUNT_DELAY)
      }
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
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

    localStorage.setItem('millyplayer_currentSong', JSON.stringify(song))
    setCurrentSong(song)
    currentSongRef.current = song

    if (newQueue) {
      localStorage.setItem('millyplayer_queue', JSON.stringify(newQueue))
      setQueue(newQueue)
      queueRef.current = newQueue
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
    const song = currentSongRef.current
    const q = queueRef.current
    if (!song || q.length === 0) return
    const idx = q.findIndex((s) => s.id === song.id)
    playSong(q[(idx + 1) % q.length], q)
  }

  function handlePrev() {
    const audio = audioRef.current!
    if (audio.currentTime > 3) { audio.currentTime = 0; return }
    const song = currentSongRef.current
    const q = queueRef.current
    if (!song || q.length === 0) return
    const idx = q.findIndex((s) => s.id === song.id)
    playSong(q[(idx - 1 + q.length) % q.length], q)
  }

  function seek(pct: number) {
    const audio = audioRef.current!
    if (duration) {
      audio.currentTime = pct * duration
      setProgress(audio.currentTime)
      localStorage.setItem('millyplayer_progress', String(audio.currentTime))
    }
  }

  function setVolume(v: number) {
    const audio = audioRef.current!
    audio.volume = v
    setVolumeState(v)
    localStorage.setItem('millyplayer_volume', String(v))
  }

  return (
    <PlayerContext.Provider
      value={{
        currentSong, queue, isPlaying, progress, duration, volume, showLyrics,
        playSong, togglePlay, next: handleNext, prev: handlePrev,
        seek, setVolume, toggleLyrics: () => setShowLyrics((p) => !p),
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)
