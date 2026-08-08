'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mobileNavItems = [
  { label: 'Home', href: '/dashboard', icon: '🏠' },
  { label: 'Invest', href: '/investments', icon: '💰' },
  { label: 'Wallet', href: '/wallet', icon: '👛' },
  { label: 'P2P', href: '/p2p', icon: '🔄' },
  { label: 'Team', href: '/team', icon: '👥' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 text-white shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-blue-500 font-bold bg-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
