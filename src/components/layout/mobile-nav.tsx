'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mobileNavItems = [
  { label: 'Home', href: '/dashboard', icon: '🏠' },
  { label: 'Wallet', href: '/wallet', icon: '👛' },
  { label: 'Team', href: '/team', icon: '👥' },
  { label: 'Income', href: '/self-roi', icon: '💰' },
  { label: 'Profile', href: '/profile', icon: '👤' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
