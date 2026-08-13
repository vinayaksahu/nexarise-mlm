'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSecurityPage() {
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (passForm.newPassword !== passForm.confirmPassword) {
      setMsg({ text: 'New passwords do not match', isError: true });
      return;
    }

    if (passForm.newPassword.length < 6) {
      setMsg({ text: 'New password must be at least 6 characters long', isError: true });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/security/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ text: data.error || 'Failed to update password', isError: true });
      } else {
        setMsg({ text: 'Admin password updated successfully!', isError: false });
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setMsg({ text: 'Connection error. Please try again.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🔑 Admin Password Settings</span>
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage and update your administrator login password
        </p>
      </div>

      <Card className="bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 shadow-xl">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {msg && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                msg.isError
                  ? 'bg-red-500/10 border border-red-500/30 text-red-500'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
              }`}
            >
              <span>{msg.isError ? '⚠️' : '✅'}</span>
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Current Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                  className="w-full text-sm py-2.5 pr-10 bg-gray-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm p-1"
                >
                  {showCurrent ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                New Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password (min. 6 characters)"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                  className="w-full text-sm py-2.5 pr-10 bg-gray-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm p-1"
                >
                  {showNew ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Confirm New Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  className="w-full text-sm py-2.5 pr-10 bg-gray-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm p-1"
                >
                  {showConfirm ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 text-xs rounded-xl shadow-md transition-all mt-2"
            >
              {loading ? 'Updating Password...' : '🔒 Update Admin Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
