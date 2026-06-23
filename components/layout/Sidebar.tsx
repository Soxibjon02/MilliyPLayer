'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Grid3X3, Heart, LayoutDashboard, Music, ListMusic, BarChart2, LogOut, LogIn, ListPlus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const publicLinks = [
  { href: '/home', label: 'Bosh sahifa', icon: Home },
  { href: '/search', label: 'Qidirish', icon: Search },
  { href: '/categories', label: 'Kategoriyalar', icon: Grid3X3 },
]

const authLinks = [
  { href: '/favorites', label: 'Sevimlilar', icon: Heart },
  { href: '/playlists', label: 'Playlistlar', icon: ListPlus },
]

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: BarChart2 },
  { href: '/admin/songs', label: 'Musiqalar', icon: Music },
  { href: '/admin/categories', label: 'Kategoriyalar', icon: ListMusic },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isAdminRoute = pathname.startsWith('/admin')

  const navLinks = isAdminRoute && isAdmin
    ? adminLinks
    : user
    ? [...publicLinks, ...authLinks]
    : publicLinks

  return (
    <>
      {/* Premium Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-sidebar-DEFAULT dark:bg-sidebar-dark border-r border-gray-200 dark:border-gray-800 flex-col z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-800">
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">MilliyPlayer</span>
          </Link>
        </div>

        {/* Admin toggle */}
        {isAdmin && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            {isAdminRoute ? (
              <Link
                href="/home"
                className="flex items-center gap-2 text-xs font-medium text-primary hover:opacity-80 transition"
              >
                <Home className="w-3.5 h-3.5" />
                Saytga o'tish
              </Link>
            ) : (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-xs font-medium text-primary hover:opacity-80 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin panel
              </Link>
            )}
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/home' && href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: user info or login button */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
          {user ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition w-full"
              >
                <LogOut className="w-4 h-4" />
                Chiqish
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition justify-center"
            >
              <LogIn className="w-4 h-4" />
              Kirish
            </Link>
          )}
        </div>
      </aside>

      {/* Premium Mobile Bottom Navigation Bar (App Bar Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-gray-900 flex justify-around items-center z-40 px-2 pb-safe">
        {navLinks.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/home' && href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all duration-300',
                active
                  ? 'text-primary scale-105'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[70px]">{label}</span>
            </Link>
          )
        })}

        {/* Profile / Login representation on Mobile bottom bar */}
        {user ? (
          <button
            onClick={() => {
              if (confirm("Tizimdan chiqishni xohlaysizmi?")) logout()
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 text-gray-500 dark:text-gray-400 text-[10px] font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold mb-0.5">
              {user.name[0].toUpperCase()}
            </div>
            <span>Chiqish</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center flex-1 py-1 text-gray-500 dark:text-gray-400 text-[10px] font-medium"
          >
            <LogIn className="w-5 h-5 mb-0.5" />
            <span>Kirish</span>
          </Link>
        )}
      </nav>
    </>
  )
}
