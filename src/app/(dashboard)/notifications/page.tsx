'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    try {
      const res = await fetch(`/api/notifications?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '📥';
      case 'WITHDRAWAL':
        return '📤';
      case 'INVESTMENT':
        return '💰';
      case 'INCOME':
        return '💵';
      case 'P2P':
        return '🔄';
      case 'ACCOUNT':
        return '👤';
      case 'REWARD':
        return '🎁';
      case 'SECURITY':
        return '🔒';
      case 'SUPPORT':
        return '🎧';
      default:
        return '🔔';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🔔 Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="danger" className="text-xs px-2 py-0.5 font-bold">
                {unreadCount} Unread
              </Badge>
            )}
          </h1>
          <p className="text-xs text-muted mt-1">Real-time system events, financial updates & account activities</p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={markAllRead}
            variant="outline"
            className="text-xs py-2 px-3 self-start sm:self-auto border-gray-200 dark:border-slate-800"
          >
            ✓ Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800/80 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'read'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted animate-pulse">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <Card className="p-8 text-center text-muted space-y-2">
          <p className="text-3xl">🔕</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">No notifications found</p>
          <p className="text-xs text-muted">You have no {filter !== 'all' ? filter : ''} notifications at this time.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-all border ${
                !n.isRead
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                  : 'border-gray-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 pt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => !n.isRead && markSingleRead(n.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      View Details →
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markSingleRead(n.id)}
                      className="text-xs text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-1"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
