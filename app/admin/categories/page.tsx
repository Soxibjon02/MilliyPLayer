'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import { Category } from '@/lib/types'
import { Plus, Pencil, Trash2, ListMusic, Check, X } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Xato yuz berdi')
      } else {
        setCategories((prev) => [...prev, data.category])
        setNewName('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tarmoq xatosi')
    } finally {
      setAdding(false)
    }
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) return
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === id ? data.category : c)))
      setEditId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu kategoriyani o\'chirishni tasdiqlaysizmi?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <AppLayout adminOnly>
      <Header title="Kategoriyalar boshqaruvi" />
      <main className="px-6 py-6">
        <div className="max-w-lg">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Yangi kategoriya nomi..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Qo'shish
            </button>
          </form>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <ListMusic className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Hali kategoriya qo'shilmagan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-4 h-4 text-primary" />
                  </div>
                  {editId === cat.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(cat.id)}
                        className="flex-1 px-2 py-1 rounded border border-primary bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                      />
                      <button onClick={() => handleEdit(cat.id)} className="text-green-500 hover:text-green-400">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                      <button onClick={() => { setEditId(cat.id); setEditName(cat.name) }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
