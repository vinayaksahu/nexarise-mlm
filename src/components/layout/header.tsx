'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'

interface HeaderProps {
  user?: { name: string; username: string; role: string } | null
}

export function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetch('/api/notifications').then(r => r.json()).then(data => {
        if (data.notifications) setNotifications(data.notifications)
      })
    }
  }, [user])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

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
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-all duration-200 relative">
            🔔
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">{unreadCount}</span>}
          </button>
          
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-border py-2 z-50">
              <div className="flex justify-between items-center px-4 mb-2">
                <span className="font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-500">Mark all as read</button>
                )}
              </div>
              <hr className="border-border mb-2" />
              {notifications.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-border/50 text-sm ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">{n.message}</div>
                    <div className="text-gray-400 text-[10px] mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
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
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
