'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark sticky top-0 z-20">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <button
        onClick={toggle}
        aria-label="Tema almashtirish"
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </header>
  )
}
