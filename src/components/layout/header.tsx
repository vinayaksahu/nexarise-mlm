'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { Sidebar } from './sidebar';

interface HeaderProps {
  user?: { name: string; username: string; role: string } | null;
  isAdmin?: boolean;
}

export function Header({ user, isAdmin = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((r) => r.json())
        .then((data) => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between px-3 sm:px-6 shadow-md">
        {/* Left Controls: Hamburger Menu & Mobile Brand Logo (hidden on desktop lg:hidden) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors text-lg"
            title="Open Navigation Menu"
          >
            ☰
          </button>
          <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-1.5 lg:hidden">
            <img
              src="/images/nexarise-emblem.png"
              alt="NexaRise Logo"
              className="w-7 h-7 object-contain shrink-0"
            />
            <span className="text-base font-bold text-white tracking-tight">
              Nexa<span className="text-blue-500">Rise</span>
            </span>
          </Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 py-2 z-50 text-gray-900 dark:text-slate-100">
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                  <span className="font-bold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-slate-800/60 text-xs ${
                        !n.isRead ? 'bg-blue-50/60 dark:bg-blue-950/40 font-medium' : ''
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{n.title}</div>
                      <div className="text-gray-600 dark:text-slate-400 mt-0.5">{n.message}</div>
                      <div className="text-gray-400 dark:text-slate-500 text-[10px] mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Account Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-slate-200">
                  {user.name} ▾
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 py-1 z-50 text-gray-900 dark:text-slate-100 text-xs">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">@{user.username}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    ⚙️ Account Settings
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    🔒 Security & PIN
                  </Link>
                  <hr className="my-1 border-gray-100 dark:border-slate-800" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50 h-full">
            <Sidebar
              isAdmin={isAdmin}
              user={user}
              isMobileDrawer={true}
              onCloseMobile={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
