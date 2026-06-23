import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { PlayerProvider } from '@/context/PlayerContext'

export const metadata: Metadata = {
  title: 'MilliyPlayer — Milliy musiqa platformasi',
  description: 'O\'zbek va milliy musiqalarni tinglash platformasi',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="bg-white dark:bg-surface-dark text-gray-900 dark:text-white">
        <ThemeProvider>
          <AuthProvider>
            <PlayerProvider>
              {children}
            </PlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
