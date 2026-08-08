'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'

interface HeaderProps {
  user?: { name: string; username: string; role: string } | null
}

export function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">N</div>
          <span className="text-lg font-bold gradient-text">NexaRise</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-all duration-200" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        
        {/* Notifications placeholder */}
        <button className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-all duration-200 relative">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        
        {/* User menu */}
        {user && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-border py-1 z-50">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => setMenuOpen(false)}>Profile</Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => setMenuOpen(false)}>Settings</Link>
                <Link href="/security" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => setMenuOpen(false)}>Security</Link>
                <hr className="my-1 border-border" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
