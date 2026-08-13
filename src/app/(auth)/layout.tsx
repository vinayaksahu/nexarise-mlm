'use client'

import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white flex flex-col items-center justify-center p-4 relative transition-colors duration-300">
      {/* Top Header Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/nexarise-emblem.png" alt="NexaRise Logo" className="h-7 w-7 object-contain" />
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
            Nexa<span className="text-blue-600 dark:text-blue-500">Rise</span>
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white shadow-xs transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="w-full max-w-md my-auto">
        {children}
      </div>
    </div>
  )
}
