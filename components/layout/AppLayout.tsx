'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import AudioPlayer from './AudioPlayer'
import Footer from './Footer'
import { useAuth } from '@/context/AuthContext'

interface AppLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean
  adminOnly?: boolean
}

export default function AppLayout({ children, requireAuth = false, adminOnly = false }: AppLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const needsAuth = requireAuth || adminOnly

  useEffect(() => {
    if (loading) return
    if (needsAuth && !user) {
      router.replace('/login')
      return
    }
    if (adminOnly && user && user.role !== 'admin') {
      router.replace('/home')
    }
  }, [user, loading, router, needsAuth, adminOnly])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-dark">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (needsAuth && !user) return null
  if (adminOnly && user?.role !== 'admin') return null

  return (
    <div className="flex min-h-screen bg-white dark:bg-surface-dark">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen pb-20">
        {children}
        {!adminOnly && <Footer />}
      </div>
      <AudioPlayer />
    </div>
  )
}
