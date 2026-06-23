'use client'

import { useState, useRef } from 'react'
import { X, Upload, Music, Loader2, CheckCircle } from 'lucide-react'
import { Song, Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SongModalProps {
  song?: Song | null
  categories: Category[]
  onClose: () => void
  onSaved: (song: Song) => void
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

// Direct Cloudinary upload — bypasses Vercel's 4.5MB body limit and 10s timeout
async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: 'image' | 'video'
): Promise<string> {
  // 1. Get a signed upload ticket from our API
  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  })
  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}))
    throw new Error(err.error ?? 'Imzo olishda xato')
  }
  const { signature, timestamp, api_key, cloud_name } = await signRes.json()

  // 2. Upload file directly to Cloudinary
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', api_key)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`,
    { method: 'POST', body: form }
  )
  const data = await uploadRes.json()
  if (!uploadRes.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? 'Fayl yuklanmadi')
  }
  return data.secure_url as string
}

export default function SongModal({ song, categories, onClose, onSaved }: SongModalProps) {
  const [title, setTitle] = useState(song?.title ?? '')
  const [artist, setArtist] = useState(song?.artist ?? '')
  const [lyrics, setLyrics] = useState(song?.lyrics ?? '')
  const [selectedCats, setSelectedCats] = useState<string[]>(song?.categoryIds ?? [])

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>(song?.coverUrl ?? '')
  const [audioName, setAudioName] = useState('')

  const [coverState, setCoverState] = useState<UploadState>('idle')
  const [audioState, setAudioState] = useState<UploadState>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const coverRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setCoverState('idle')
  }

  function handleAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioFile(file)
    setAudioName(file.name)
    setAudioState('idle')
  }

  function toggleCat(id: string) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const isNew = !song
    if (isNew && (!coverFile || !audioFile)) {
      setError("Cover rasm va audio fayl kerak")
      return
    }

    setLoading(true)
    try {
      let coverUrl = song?.coverUrl ?? ''
      let audioUrl = song?.audioUrl ?? ''

      // Upload cover directly to Cloudinary if a new file was selected
      if (coverFile) {
        setCoverState('uploading')
        try {
          coverUrl = await uploadToCloudinary(coverFile, 'millyplayer/covers', 'image')
          setCoverState('done')
        } catch (err) {
          setCoverState('error')
          throw new Error(`Cover: ${err instanceof Error ? err.message : 'yuklash xatosi'}`)
        }
      }

      // Upload audio directly to Cloudinary if a new file was selected
      if (audioFile) {
        setAudioState('uploading')
        try {
          audioUrl = await uploadToCloudinary(audioFile, 'millyplayer/audio', 'video')
          setAudioState('done')
        } catch (err) {
          setAudioState('error')
          throw new Error(`Audio: ${err instanceof Error ? err.message : 'yuklash xatosi'}`)
        }
      }

      // Save song metadata (only URLs, no file data)
      const res = await fetch(song ? `/api/songs/${song.id}` : '/api/songs', {
        method: song ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist, lyrics, categoryIds: selectedCats, coverUrl, audioUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Saqlashda xato')
      onSaved(data.song)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xato yuz berdi')
      setCoverState((s) => s === 'uploading' ? 'error' : s)
      setAudioState((s) => s === 'uploading' ? 'error' : s)
    } finally {
      setLoading(false)
    }
  }

  const isSubmitting = loading
  const submitLabel = isSubmitting
    ? coverState === 'uploading'
      ? 'Cover yuklanmoqda...'
      : audioState === 'uploading'
      ? 'Audio yuklanmoqda...'
      : 'Saqlanmoqda...'
    : song ? 'Saqlash' : "Qo'shish"

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1a1a2a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {song ? 'Musiqani tahrirlash' : "Yangi musiqa qo'shish"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Title + Artist */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nomi *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Musiqa nomi"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Ijrochi *
              </label>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                placeholder="Ijrochi nomi"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Cover */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Cover rasm {!song && '*'}
            </label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-4 flex items-center gap-4 cursor-pointer transition',
                coverState === 'error'
                  ? 'border-red-400'
                  : coverState === 'done'
                  ? 'border-green-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary'
              )}
              onClick={() => !isSubmitting && coverRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="" className="w-14 h-14 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {coverFile ? coverFile.name : 'Rasm tanlash'}
                </p>
                {coverState === 'uploading' && (
                  <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Yuklanmoqda...
                  </p>
                )}
                {coverState === 'done' && (
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3" /> Yuklandi
                  </p>
                )}
              </div>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
            </div>
          </div>

          {/* Audio */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Audio fayl {!song && '*'}
            </label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-4 flex items-center gap-4 cursor-pointer transition',
                audioState === 'error'
                  ? 'border-red-400'
                  : audioState === 'done'
                  ? 'border-green-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary'
              )}
              onClick={() => !isSubmitting && audioRef.current?.click()}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded flex items-center justify-center flex-shrink-0',
                  audioState === 'uploading' ? 'bg-primary/20' : 'bg-primary/10'
                )}
              >
                {audioState === 'uploading' ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : audioState === 'done' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Music className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {audioName || (song?.audioUrl ? 'Audio almashtirish (ixtiyoriy)' : 'Audio fayl tanlash')}
                </p>
                {audioState === 'uploading' && (
                  <p className="text-xs text-primary mt-0.5">Yuklanmoqda...</p>
                )}
                {audioState === 'done' && (
                  <p className="text-xs text-green-500 mt-0.5">Yuklandi</p>
                )}
                {audioFile && audioState === 'idle' && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
              <input
                ref={audioRef}
                type="file"
                accept="audio/*,video/mp4,.m4a,.mp3,.ogg,.wav,.flac,.aac"
                className="hidden"
                onChange={handleAudio}
              />
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Kategoriyalar
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition',
                      selectedCats.includes(c.id)
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary'
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lyrics */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Lyrics (so'z matni)
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={4}
              placeholder="Qo'shiq matnini kiriting..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
