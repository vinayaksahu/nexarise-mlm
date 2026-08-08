'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'

const userNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Investments', href: '/investments', icon: '💰' },
  { label: 'Wallet', href: '/wallet', icon: '👛' },
  { label: 'Deposits', href: '/deposits', icon: '📥' },
  { label: 'Withdrawals', href: '/withdrawals', icon: '📤' },
  { label: 'P2P Transfer', href: '/p2p', icon: '🔄' },
  { label: 'Self ROI', href: '/self-roi', icon: '📈' },
  { label: 'Level Income', href: '/level-income', icon: '🏆' },
  { label: 'Rewards', href: '/rewards', icon: '🎁' },
  { label: 'Team', href: '/team', icon: '👥' },
  { label: 'Genealogy', href: '/genealogy', icon: '🌳' },
  { label: 'Referrals', href: '/referrals', icon: '🔗' },
  { label: 'Transactions', href: '/transactions', icon: '📋' },
  { label: 'Income History', href: '/income-history', icon: '💰' },
  { label: 'Support', href: '/support', icon: '🎧' },
]

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Deposits', href: '/admin/deposits', icon: '📥' },
  { label: 'Withdrawals', href: '/admin/withdrawals', icon: '📤' },
  { label: 'Investments', href: '/admin/investments', icon: '💰' },
  { label: 'MLM', href: '/admin/mlm', icon: '🌐' },
  { label: 'Business Plan', href: '/admin/business-plan', icon: '📋' },
  { label: 'Rewards', href: '/admin/rewards', icon: '🎁' },
  { label: 'Reports', href: '/admin/reports', icon: '📊' },
  { label: 'Audit Logs', href: '/admin/audit', icon: '📜' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <aside className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-border transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">N</div>
          {!collapsed && <span className="text-lg font-bold gradient-text">NexaRise</span>}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-muted hover:text-primary transition-colors p-1">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle */}
      <div className="p-3 border-t border-border">
        <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200">
          <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  )
}
