'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';

interface SidebarProps {
  isAdmin?: boolean;
  user?: { name: string; username: string; role: string } | null;
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
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
      { label: 'Security & PIN', href: '/security', icon: '🔒' },
    ],
  },
];

const adminNavGroups = [
  {
    heading: 'CORE',
    items: [
      { label: 'Admin Dashboard', href: '/admin', icon: '📊', permission: 'dashboard.view' },
    ],
  },
  {
    heading: 'MANAGEMENT',
    items: [
      { label: 'User Management', href: '/admin/users', icon: '👥', permission: 'users.view' },
      { label: 'Promotional Activations', href: '/admin/promotions', icon: '🎁', permission: 'promotions.view' },
      { label: 'Deposit Approvals', href: '/admin/deposits', icon: '📥', permission: 'deposits.view' },
      { label: 'Deposit Methods', href: '/admin/payment-methods', icon: '💳', permission: 'deposit_methods.view' },
      { label: 'Withdrawal Payouts', href: '/admin/withdrawals', icon: '📤', permission: 'withdrawals.view' },
      { label: 'System Investments', href: '/admin/investments', icon: '💰', permission: 'investments.view' },
    ],
  },
  {
    heading: 'SYSTEM & PLAN',
    items: [
      { label: 'Business Plan Editor', href: '/admin/business-plan', icon: '📋', permission: 'plan.view' },
      { label: 'Reward Slabs', href: '/admin/rewards', icon: '🎁', permission: 'rewards.view' },
      { label: 'Audit & Security Logs', href: '/admin/audit', icon: '📜', permission: 'audit_logs.view' },
      { label: 'Admin Roles & Staff', href: '/admin/administrators', icon: '🛡️', permission: 'admins.manage' },
    ],
  },
];

export function Sidebar({ isAdmin = false, user, onCloseMobile, isMobileDrawer = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const userRole = user?.role || (isAdmin ? 'ADMIN' : 'USER');

  // Filter admin nav groups based on permissions
  const filteredAdminNavGroups = adminNavGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(userRole, item.permission as any))
  })).filter(group => group.items.length > 0);

  const navGroups = isAdmin ? filteredAdminNavGroups : userNavGroups;

  const baseClasses = isMobileDrawer
    ? 'flex flex-col h-full bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-300 w-full overflow-hidden'
    : `hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-300 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`;

  return (
    <aside className={baseClasses}>
      {/* Brand Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <Link
          href={isAdmin ? '/admin' : '/dashboard'}
          className="flex items-center gap-2.5"
          onClick={onCloseMobile}
        >
          <img
            src="/images/nexarise-emblem.png"
            alt="NexaRise Logo"
            className="w-8 h-8 object-contain shrink-0 drop-shadow"
          />
          {(!collapsed || isMobileDrawer) && (
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Nexa<span className="text-blue-600 dark:text-blue-500">Rise</span>
            </span>
          )}
        </Link>
        {!isMobileDrawer && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ml-auto text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? '➔' : '☰'}
          </button>
        )}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="ml-auto text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 font-bold"
            title="Close Drawer"
          >
            ✕
          </button>
        )}
      </div>

      {/* SB Admin Navigation Accordions */}
      <nav className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2 px-2.5 space-y-2.5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-0.5">
            {(!collapsed || isMobileDrawer) && (
              <div className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mt-1 mb-0.5">
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
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={collapsed && !isMobileDrawer ? item.label : undefined}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  {(!collapsed || isMobileDrawer) && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
