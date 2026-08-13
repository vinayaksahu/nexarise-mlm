'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SecurityPage() {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pins, setPins] = useState({ password: '', newPin: '', confirmPin: '' });
  
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdStatus, setPwdStatus] = useState<'success' | 'error'>('success');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [pinMsg, setPinMsg] = useState('');
  const [pinStatus, setPinStatus] = useState<'success' | 'error'>('success');
  const [pinLoading, setPinLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    if (passwords.new !== passwords.confirm) {
      setPwdMsg("New passwords don't match");
      setPwdStatus('error');
      return;
    }
    if (passwords.new.length < 6) {
      setPwdMsg('Password must be at least 6 characters');
      setPwdStatus('error');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch('/api/security/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMsg('🎉 Password updated successfully!');
        setPwdStatus('success');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        setPwdMsg(data.error || 'Failed to update password');
        setPwdStatus('error');
      }
    } catch (err) {
      setPwdMsg('Error updating password');
      setPwdStatus('error');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg('');
    if (pins.newPin !== pins.confirmPin) {
      setPinMsg("PINs don't match");
      setPinStatus('error');
      return;
    }
    if (!/^\d{6}$/.test(pins.newPin)) {
      setPinMsg('PIN must be exactly 6 digits');
      setPinStatus('error');
      return;
    }

    setPinLoading(true);
    try {
      const res = await fetch('/api/security/transaction-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pins.newPin, currentPassword: pins.password }),
      });
      const data = await res.json();
      if (res.ok) {
        setPinMsg('🎉 Transaction PIN updated successfully!');
        setPinStatus('success');
        setPins({ password: '', newPin: '', confirmPin: '' });
      } else {
        setPinMsg(data.error || 'Failed to update PIN');
        setPinStatus('error');
      }
    } catch (err) {
      setPinMsg('Error updating PIN');
      setPinStatus('error');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header & Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & PIN</h1>
          <p className="text-xs text-muted mt-1">Manage password authentication & 6-digit transaction PIN security</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            ⚙️ Account Settings
          </Link>
          <Link
            href="/security"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-xs"
          >
            🔒 Security & PIN
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Password Card */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🔑</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
              <p className="text-xs text-muted">Update your account login password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Current Password</label>
              <Input
                type="password"
                required
                placeholder="Enter current password"
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full text-sm py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">New Password</label>
              <Input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={passwords.new}
                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full text-sm py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <Input
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full text-sm py-2.5"
              />
            </div>

            {pwdMsg && (
              <div className={`p-3 rounded-xl text-xs font-medium ${pwdStatus === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                {pwdMsg}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5" disabled={pwdLoading}>
              {pwdLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </Card>

        {/* Transaction PIN Card */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🔢</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction PIN</h2>
              <p className="text-xs text-muted">6-digit PIN required for withdrawals & P2P transfers</p>
            </div>
          </div>

          <form onSubmit={handleChangePin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Account Password</label>
              <Input
                type="password"
                required
                placeholder="Enter account password to verify"
                value={pins.password}
                onChange={e => setPins({ ...pins, password: e.target.value })}
                className="w-full text-sm py-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">New 6-Digit PIN</label>
              <Input
                type="password"
                maxLength={6}
                required
                placeholder="6 digits (e.g. 123456)"
                value={pins.newPin}
                onChange={e => setPins({ ...pins, newPin: e.target.value })}
                className="w-full text-sm py-2.5 font-mono tracking-widest"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm New PIN</label>
              <Input
                type="password"
                maxLength={6}
                required
                placeholder="Re-enter 6-digit PIN"
                value={pins.confirmPin}
                onChange={e => setPins({ ...pins, confirmPin: e.target.value })}
                className="w-full text-sm py-2.5 font-mono tracking-widest"
              />
            </div>

            {pinMsg && (
              <div className={`p-3 rounded-xl text-xs font-medium ${pinStatus === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                {pinMsg}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5" disabled={pinLoading}>
              {pinLoading ? 'Updating PIN...' : 'Set / Update Transaction PIN'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
