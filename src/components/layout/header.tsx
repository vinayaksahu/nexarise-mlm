'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = () => {
    if (user) {
      fetch('/api/notifications?filter=unread')
        .then((r) => r.json())
        .then((data) => {
          if (data.notifications) setNotifications(data.notifications);
          if (typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount);
          } else if (data.notifications) {
            setUnreadCount(data.notifications.length);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchNotifs();
    // Lightweight polling every 15 seconds for real-time notification updates
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications([]);
    setUnreadCount(0);
  };

  const markSingleRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(isAdmin ? '/admin/login' : '/login');
    router.refresh();
  };

  const handleNotifToggle = () => {
    setNotifOpen((prev) => !prev);
    setMenuOpen(false);
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
    setNotifOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white dark:bg-slate-950 text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 shadow-xs transition-colors shrink-0">
        {/* Left Controls: Hamburger Menu & Mobile Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-lg"
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
            <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Nexa<span className="text-blue-600 dark:text-blue-500">Rise</span>
            </span>
          </Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotifToggle}
              className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-80 max-h-[80vh] sm:max-h-96 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 py-2 z-[9999] text-gray-900 dark:text-slate-100 animate-fade-in">
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                  <span className="font-bold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">No new notifications</div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-slate-800/60 text-xs transition-colors flex items-start justify-between gap-2 ${
                        !n.isRead ? 'bg-blue-50/60 dark:bg-blue-950/40 font-medium' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900 dark:text-white truncate">{n.title}</span>
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                        </div>
                        <div className="text-gray-600 dark:text-slate-400 mt-0.5 leading-snug">{n.message}</div>
                        <div className="text-gray-400 dark:text-slate-500 text-[10px] mt-1 flex items-center justify-between">
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                          {n.link && (
                            <Link
                              href={n.link}
                              onClick={() => setNotifOpen(false)}
                              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                            >
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markSingleRead(n.id)}
                          className="text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 text-xs p-1"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  ))
                )}
                <div className="border-t border-gray-100 dark:border-slate-800 p-2 text-center">
                  <Link
                    href={isAdmin ? '/admin/notifications' : '/notifications'}
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline block py-1"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-gray-800 dark:text-slate-200">
                  {user.name} ▾
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 py-1 z-[9999] text-gray-900 dark:text-slate-100 text-xs animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">@{user.username}</p>
                  </div>
                  {isAdmin ? (
                    <Link
                      href="/admin/security"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      🔑 Change Password
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        ⚙️ Account Settings
                      </Link>
                      <Link
                        href="/security"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        🔒 Security & PIN
                      </Link>
                    </>
                  )}
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
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 z-50 h-full">
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
