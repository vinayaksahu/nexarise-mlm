'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
        setProfileMsg('🎉 Profile updated successfully!');
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header & Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-xs text-muted mt-1">Manage your personal profile, contact information & receiving USDT wallet</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-xs"
          >
            ⚙️ Account Settings
          </Link>
          <Link
            href="/security"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            🔒 Security & PIN
          </Link>
        </div>
      </div>

      {/* Profile Details Card */}
      <Card className="p-5 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Profile Details</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
              <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Username (Read-Only)</label>
              <Input value={profile.username} disabled className="w-full text-sm py-2.5 bg-gray-100 dark:bg-slate-900 text-muted" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Email Address (Read-Only)</label>
              <Input value={profile.email} disabled className="w-full text-sm py-2.5 bg-gray-100 dark:bg-slate-900 text-muted" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Mobile Number</label>
              <Input value={profile.mobile} placeholder="e.g. +1234567890" onChange={e => setProfile({ ...profile, mobile: e.target.value })} className="w-full text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Receiving USDT (BEP-20) Address</label>
              <Input value={profile.walletAddress} placeholder="0x..." onChange={e => setProfile({ ...profile, walletAddress: e.target.value })} className="w-full text-sm py-2.5 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Profile Picture / Avatar URL</label>
              <Input value={profile.profilePic} placeholder="https://..." onChange={e => setProfile({ ...profile, profilePic: e.target.value })} className="w-full text-sm py-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Physical / Postal Address</label>
            <Input value={profile.address} placeholder="Street, City, Country" onChange={e => setProfile({ ...profile, address: e.target.value })} className="w-full text-sm py-2.5" />
          </div>

          {profileMsg && (
            <div className={`p-3 rounded-xl text-xs font-medium ${profileStatus === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
              {profileMsg}
            </div>
          )}

          <Button type="submit" className="w-full sm:w-auto px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5" disabled={profileLoading}>
            {profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
