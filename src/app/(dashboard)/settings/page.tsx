'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
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
        setPwdMsg('Password updated successfully!');
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
        setPinMsg('Transaction PIN updated successfully!');
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
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <Input type="password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input type="password" required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <Input type="password" required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full text-sm py-2.5" />
            </div>

            {pwdMsg && (
              <p className={`text-xs ${pwdStatus === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>{pwdMsg}</p>
            )}

            <Button type="submit" className="w-full" disabled={pwdLoading}>
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Transaction PIN</h2>
          <p className="text-xs text-slate-400 mb-4">Set up or change your 6-digit transaction PIN for withdrawals and P2P transfers.</p>
          <form onSubmit={handleChangePin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Password</label>
              <Input type="password" required placeholder="Enter password to confirm" value={pins.password} onChange={e => setPins({...pins, password: e.target.value})} className="w-full text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New 6-Digit PIN</label>
              <Input type="password" maxLength={6} required placeholder="6 digits (e.g. 123456)" value={pins.newPin} onChange={e => setPins({...pins, newPin: e.target.value})} className="w-full text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New PIN</label>
              <Input type="password" maxLength={6} required placeholder="Re-enter 6-digit PIN" value={pins.confirmPin} onChange={e => setPins({...pins, confirmPin: e.target.value})} className="w-full text-sm py-2.5" />
            </div>

            {pinMsg && (
              <p className={`text-xs ${pinStatus === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>{pinMsg}</p>
            )}

            <Button type="submit" className="w-full" disabled={pinLoading}>
              {pinLoading ? 'Updating...' : 'Set / Update PIN'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
