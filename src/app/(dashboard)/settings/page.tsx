'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    address: '',
    walletAddress: '',
    profilePic: '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileStatus, setProfileStatus] = useState<'success' | 'error'>('success');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pins, setPins] = useState({ password: '', newPin: '', confirmPin: '' });
  
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdStatus, setPwdStatus] = useState<'success' | 'error'>('success');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [pinMsg, setPinMsg] = useState('');
  const [pinStatus, setPinStatus] = useState<'success' | 'error'>('success');
  const [pinLoading, setPinLoading] = useState(false);

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile({
              name: data.profile.name || '',
              username: data.profile.username || '',
              email: data.profile.email || '',
              mobile: data.profile.mobile || '',
              address: data.profile.address || '',
              walletAddress: data.profile.walletAddress || '',
              profilePic: data.profile.profilePic || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          mobile: profile.mobile,
          address: profile.address,
          walletAddress: profile.walletAddress,
          profilePic: profile.profilePic,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg('Profile updated successfully! 🎉');
        setProfileStatus('success');
      } else {
        setProfileMsg(data.error || 'Failed to update profile');
        setProfileStatus('error');
      }
    } catch (err) {
      setProfileMsg('Error updating profile');
      setProfileStatus('error');
    } finally {
      setProfileLoading(false);
    }
  };

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

      {/* Profile Details Card */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-4">Profile Details</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username (Read-Only)</label>
              <Input value={profile.username} disabled className="w-full text-sm py-2.5 bg-gray-100 dark:bg-slate-900 text-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address (Read-Only)</label>
              <Input value={profile.email} disabled className="w-full text-sm py-2.5 bg-gray-100 dark:bg-slate-900 text-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <Input value={profile.mobile} placeholder="e.g. +1234567890" onChange={e => setProfile({...profile, mobile: e.target.value})} className="w-full text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Receiving USDT (BEP-20) Address</label>
              <Input value={profile.walletAddress} placeholder="0x..." onChange={e => setProfile({...profile, walletAddress: e.target.value})} className="w-full text-sm py-2.5 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Picture / Avatar URL</label>
              <Input value={profile.profilePic} placeholder="https://..." onChange={e => setProfile({...profile, profilePic: e.target.value})} className="w-full text-sm py-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Physical / Postal Address</label>
            <Input value={profile.address} placeholder="Street, City, Country" onChange={e => setProfile({...profile, address: e.target.value})} className="w-full text-sm py-2.5" />
          </div>

          {profileMsg && (
            <p className={`text-xs ${profileStatus === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>{profileMsg}</p>
          )}

          <Button type="submit" className="w-full sm:w-auto px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold" disabled={profileLoading}>
            {profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}
          </Button>
        </form>
      </Card>

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
