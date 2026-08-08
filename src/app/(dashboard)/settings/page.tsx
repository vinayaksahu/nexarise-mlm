'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pins, setPins] = useState({ current: '', new: '', confirm: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return alert("Passwords don't match");
    // Implementation for password change API call
    alert('Password change functionality to be implemented');
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pins.new !== pins.confirm) return alert("PINs don't match");
    // Implementation for PIN change API call
    alert('PIN change functionality to be implemented');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <Input type="password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input type="password" required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <Input type="password" required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
            </div>
            <Button type="submit" className="w-full">Update Password</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Transaction PIN</h2>
          <p className="text-sm text-gray-500 mb-4">Set up or change your 6-digit transaction PIN for withdrawals and transfers.</p>
          <form onSubmit={handleChangePin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current PIN (if set)</label>
              <Input type="password" maxLength={6} value={pins.current} onChange={e => setPins({...pins, current: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New 6-Digit PIN</label>
              <Input type="password" maxLength={6} required value={pins.new} onChange={e => setPins({...pins, new: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New PIN</label>
              <Input type="password" maxLength={6} required value={pins.confirm} onChange={e => setPins({...pins, confirm: e.target.value})} />
            </div>
            <Button type="submit" className="w-full">Update PIN</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
