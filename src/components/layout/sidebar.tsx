'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';

interface SidebarProps {
  isAdmin?: boolean;
  user?: { name: string; username: string; role: string } | null;
  onCloseMobile?: () => void;
}

const userNavGroups = [
  {
    heading: 'CORE',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    ],
  },
  {
    heading: 'FINANCIAL OPS',
    items: [
      { label: 'Investments', href: '/investments', icon: '💰' },
      { label: 'Wallet', href: '/wallet', icon: '👛' },
      { label: 'Deposits', href: '/deposits', icon: '📥' },
      { label: 'Withdrawals', href: '/withdrawals', icon: '📤' },
      { label: 'P2P Transfer', href: '/p2p', icon: '🔄' },
      { label: 'Income History', href: '/income-history', icon: '💵' },
      { label: 'Transactions', href: '/transactions', icon: '📋' },
    ],
  },
  {
    heading: 'NETWORK & TEAM',
    items: [
      { label: 'Team & Referrals', href: '/team', icon: '👥' },
      { label: 'Genealogy Tree', href: '/genealogy', icon: '🌳' },
      { label: 'Self ROI', href: '/self-roi', icon: '📈' },
      { label: 'Level Income', href: '/level-income', icon: '🏆' },
      { label: 'Rewards & Ranks', href: '/rewards', icon: '🎁' },
    ],
  },
  {
    heading: 'SUPPORT & SETTINGS',
    items: [
      { label: 'Help & Support', href: '/support', icon: '🎧' },
      { label: 'Account Settings', href: '/settings', icon: '⚙️' },
    ],
  },
];

const adminNavGroups = [
  {
    heading: 'CORE',
    items: [
      { label: 'Admin Dashboard', href: '/admin', icon: '📊' },
    ],
  },
  {
    heading: 'MANAGEMENT',
    items: [
      { label: 'User Management', href: '/admin/users', icon: '👥' },
      { label: 'Deposit Approvals', href: '/admin/deposits', icon: '📥' },
      { label: 'Withdrawal Payouts', href: '/admin/withdrawals', icon: '📤' },
      { label: 'System Investments', href: '/admin/investments', icon: '💰' },
    ],
  },
  {
    heading: 'SYSTEM & PLAN',
    items: [
      { label: 'Business Plan Editor', href: '/admin/business-plan', icon: '📋' },
      { label: 'Reward Slabs', href: '/admin/rewards', icon: '🎁' },
      { label: 'Audit & Security Logs', href: '/admin/audit', icon: '📜' },
    ],
  },
  {
    heading: 'USER PANEL',
    items: [
      { label: 'Back to User Dashboard', href: '/dashboard', icon: '⬅️' },
    ],
  },
];

export function Sidebar({ isAdmin = false, user, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const navGroups = isAdmin ? adminNavGroups : userNavGroups;

  return (
    <aside
      className={`flex flex-col h-full lg:h-screen sticky top-0 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800 bg-slate-950 shrink-0">
        <Link
          href={isAdmin ? '/admin' : '/dashboard'}
          className="flex items-center gap-2.5"
          onClick={onCloseMobile}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            N
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-white">
              Nexa<span className="text-blue-500">Rise</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? '➔' : '☰'}
        </button>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden ml-auto text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800"
          >
            ✕
          </button>
        )}
      </div>

      {/* SB Admin Navigation Accordions */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {group.heading}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' &&
                  item.href !== '/admin' &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Theme Toggle Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <span className="text-sm">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  );
}
