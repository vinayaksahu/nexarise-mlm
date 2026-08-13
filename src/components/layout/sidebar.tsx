'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { useLanguage } from '@/components/language-provider';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  History,
  FileText,
  Users,
  GitFork,
  Trophy,
  Gift,
  HelpCircle,
  Settings,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  ShieldAlert,
  UserCog,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isAdmin?: boolean;
  user?: { name: string; username: string; role: string } | null;
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

export function Sidebar({ isAdmin = false, user, onCloseMobile, isMobileDrawer = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const userRole = user?.role || (isAdmin ? 'ADMIN' : 'USER');

  const userNavGroups = [
    {
      heading: t('core'),
      items: [
        { label: t('dashboard'), href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      heading: t('financialOps'),
      items: [
        { label: t('investments'), href: '/investments', icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
        { label: t('wallet'), href: '/wallet', icon: <Wallet className="w-4 h-4 text-blue-500" /> },
        { label: t('deposits'), href: '/deposits', icon: <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> },
        { label: t('withdrawals'), href: '/withdrawals', icon: <ArrowUpRight className="w-4 h-4 text-red-500" /> },
        { label: t('p2pTransfer'), href: '/p2p', icon: <Repeat className="w-4 h-4 text-cyan-400" /> },
        { label: 'Income History', href: '/income-history', icon: <History className="w-4 h-4 text-amber-500" /> },
        { label: t('recentTransactions'), href: '/transactions', icon: <FileText className="w-4 h-4 text-slate-400" /> },
      ],
    },
    {
      heading: t('networkTeam'),
      items: [
        { label: t('teamReferrals'), href: '/team', icon: <Users className="w-4 h-4 text-blue-400" /> },
        { label: t('genealogyTree'), href: '/genealogy', icon: <GitFork className="w-4 h-4 text-emerald-500" /> },
        { label: 'Self ROI', href: '/self-roi', icon: <TrendingUp className="w-4 h-4 text-purple-400" /> },
        { label: 'Level Income', href: '/level-income', icon: <Trophy className="w-4 h-4 text-yellow-500" /> },
        { label: t('rewardsRanks'), href: '/rewards', icon: <Gift className="w-4 h-4 text-amber-400" /> },
      ],
    },
    {
      heading: 'SUPPORT & SETTINGS',
      items: [
        { label: 'Help & Support', href: '/support', icon: <HelpCircle className="w-4 h-4 text-cyan-400" /> },
        { label: t('accountSettings'), href: '/settings', icon: <Settings className="w-4 h-4 text-slate-400" /> },
        { label: t('securityPin'), href: '/security', icon: <ShieldCheck className="w-4 h-4 text-indigo-400" /> },
      ],
    },
  ];

  const adminNavGroups = [
    {
      heading: t('core'),
      items: [
        { label: t('adminDashboard'), href: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, permission: 'dashboard.view' },
      ],
    },
    {
      heading: 'MANAGEMENT',
      items: [
        { label: t('userManagement'), href: '/admin/users', icon: <Users className="w-4 h-4 text-blue-400" />, permission: 'users.view' },
        { label: t('promotions'), href: '/admin/promotions', icon: <Gift className="w-4 h-4 text-purple-400" />, permission: 'promotions.view' },
        { label: 'Deposit Approvals', href: '/admin/deposits', icon: <ArrowDownLeft className="w-4 h-4 text-emerald-400" />, permission: 'deposits.view' },
        { label: 'Deposit Methods', href: '/admin/payment-methods', icon: <CreditCard className="w-4 h-4 text-indigo-400" />, permission: 'deposit_methods.view' },
        { label: 'Withdrawal Payouts', href: '/admin/withdrawals', icon: <ArrowUpRight className="w-4 h-4 text-red-500" />, permission: 'withdrawals.view' },
        { label: t('systemInvestments'), href: '/admin/investments', icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, permission: 'investments.view' },
      ],
    },
    {
      heading: 'SYSTEM & PLAN',
      items: [
        { label: 'Business Plan Editor', href: '/admin/business-plan', icon: <ClipboardList className="w-4 h-4 text-amber-400" />, permission: 'plan.view' },
        { label: 'Reward Slabs', href: '/admin/rewards', icon: <Gift className="w-4 h-4 text-cyan-400" />, permission: 'rewards.view' },
        { label: 'Audit & Security Logs', href: '/admin/audit', icon: <ShieldAlert className="w-4 h-4 text-slate-400" />, permission: 'audit_logs.view' },
        { label: 'Admin Roles & Staff', href: '/admin/administrators', icon: <UserCog className="w-4 h-4 text-blue-500" />, permission: 'admins.manage' },
      ],
    },
  ];

  const filteredAdminNavGroups = adminNavGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(userRole, item.permission as any))
  })).filter(group => group.items.length > 0);

  const navGroups = isAdmin ? filteredAdminNavGroups : userNavGroups;

  const baseClasses = isMobileDrawer
    ? 'flex flex-col h-full bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-300 w-full overflow-hidden'
    : `hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-300 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 shrink-0 ${
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
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="ml-auto text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 font-bold"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* SB Admin Navigation Accordions */}
      <nav className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 px-3 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {(!collapsed || isMobileDrawer) && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">
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
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={collapsed && !isMobileDrawer ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
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
