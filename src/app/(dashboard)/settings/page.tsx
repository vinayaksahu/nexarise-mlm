'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    address: '',
    profilePic: '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileStatus, setProfileStatus] = useState<'success' | 'error'>('success');
  const [profileLoading, setProfileLoading] = useState(false);

  // Initial loading state to prevent flash of un-filtered methods
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Receiving Payout Methods (Crypto, Banking, UPI)
  const [payoutData, setPayoutData] = useState({
    defaultPayoutMethod: 'CRYPTO',
    cryptoWalletAddress: '',
    cryptoNetwork: 'USDT (BEP-20)',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankBranch: '',
    upiId: '',
  });

  // Admin-controlled active receiving method categories
  const [enabledMethods, setEnabledMethods] = useState<{
    CRYPTO: boolean;
    BANKING: boolean;
    UPI: boolean;
  }>({
    CRYPTO: true,
    BANKING: true,
    UPI: true,
  });

  const [payoutMsg, setPayoutMsg] = useState('');
  const [payoutStatus, setPayoutStatus] = useState<'success' | 'error'>('success');
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [resProfile, resPm] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/payment-methods'),
        ]);

        let hasCrypto = true;
        let hasBanking = true;
        let hasUpi = true;

        if (resPm.ok) {
          const pmData = await resPm.json();
          const activeList = pmData.methods || [];
          if (activeList.length > 0) {
            hasCrypto = activeList.some((m: any) => m.type === 'CRYPTO' && m.isActive);
            hasBanking = activeList.some((m: any) => m.type === 'BANKING' && m.isActive);
            hasUpi = activeList.some((m: any) => m.type === 'UPI' && m.isActive);

            setEnabledMethods({
              CRYPTO: hasCrypto,
              BANKING: hasBanking,
              UPI: hasUpi,
            });
          }
        }

        if (resProfile.ok) {
          const data = await resProfile.json();
          if (data.profile) {
            setProfile({
              name: data.profile.name || '',
              username: data.profile.username || '',
              email: data.profile.email || '',
              mobile: data.profile.mobile || '',
              address: data.profile.address || '',
              profilePic: data.profile.profilePic || '',
            });

            let defaultMethod = data.profile.defaultPayoutMethod || 'CRYPTO';
            
            // Auto-fallback if active default was disabled by admin
            if (defaultMethod === 'CRYPTO' && !hasCrypto) {
              defaultMethod = hasBanking ? 'BANKING' : hasUpi ? 'UPI' : 'CRYPTO';
            } else if (defaultMethod === 'BANKING' && !hasBanking) {
              defaultMethod = hasCrypto ? 'CRYPTO' : hasUpi ? 'UPI' : 'BANKING';
            } else if (defaultMethod === 'UPI' && !hasUpi) {
              defaultMethod = hasCrypto ? 'CRYPTO' : hasBanking ? 'BANKING' : 'UPI';
            }

            setPayoutData({
              defaultPayoutMethod: defaultMethod,
              cryptoWalletAddress: data.profile.cryptoWalletAddress || '',
              cryptoNetwork: data.profile.cryptoNetwork || 'USDT (BEP-20)',
              bankName: data.profile.bankName || '',
              bankAccountName: data.profile.bankAccountName || '',
              bankAccountNumber: data.profile.bankAccountNumber || '',
              bankIfscCode: data.profile.bankIfscCode || '',
              bankBranch: data.profile.bankBranch || '',
              upiId: data.profile.upiId || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings data:', err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadData();
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

  const handleUpdatePayoutMethods = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMsg('');
    setPayoutLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payoutData,
          walletAddress: payoutData.cryptoWalletAddress,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayoutMsg('🎉 Receiving payment methods & default payout choice updated successfully!');
        setPayoutStatus('success');
      } else {
        setPayoutMsg(data.error || 'Failed to update receiving payment methods');
        setPayoutStatus('error');
      }
    } catch (err) {
      setPayoutMsg('Error updating receiving payment methods');
      setPayoutStatus('error');
    } finally {
      setPayoutLoading(false);
    }
  };

  // Filter methods based on Admin active controls
  const allMethodDefs = [
    { id: 'CRYPTO', label: '⚡ Crypto Wallet', desc: 'USDT BEP-20 / TRC-20' },
    { id: 'BANKING', label: '🏦 Bank Account', desc: 'Direct Bank Transfer' },
    { id: 'UPI', label: '📱 UPI Payment', desc: 'Instant UPI ID / VPA' },
  ];

  const availableMethods = allMethodDefs.filter((m) => enabledMethods[m.id as keyof typeof enabledMethods]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header & Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-xs text-muted mt-1">Manage your personal profile, receiving payout methods & account details</p>
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

      {/* Personal Profile Details Card */}
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
            {profileLoading ? 'Saving Profile...' : 'Save Profile Details'}
          </Button>
        </form>
      </Card>

      {/* Receiving Payment Methods (Controlled by Admin Panel) */}
      <Card className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              💳 Receiving Payout Methods
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Set up your withdrawal receiving accounts and select your active default. (Controlled by system admin)
            </p>
          </div>
          {!isInitialLoading && (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold self-start sm:self-auto">
              Default Active Method: <span className="uppercase ml-1 font-bold">{payoutData.defaultPayoutMethod}</span>
            </Badge>
          )}
        </div>

        {isInitialLoading ? (
          <div className="space-y-6 animate-pulse py-4">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-100 dark:bg-slate-800/60 rounded-xl"></div>
              <div className="h-24 bg-gray-100 dark:bg-slate-800/60 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="h-48 bg-gray-100 dark:bg-slate-800/60 rounded-xl"></div>
              <div className="h-48 bg-gray-100 dark:bg-slate-800/60 rounded-xl"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdatePayoutMethods} className="space-y-6">
            {/* Method Selection Radio Buttons (Only Admin-Enabled methods are shown) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Select Default Payout Receiving Method
              </label>
              {availableMethods.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                  ⚠️ Receiving payout methods are currently disabled by the System Admin. Please contact support.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {availableMethods.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setPayoutData({ ...payoutData, defaultPayoutMethod: m.id })}
                      className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        payoutData.defaultPayoutMethod === m.id
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-600/30'
                          : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{m.label}</span>
                        <input
                          type="radio"
                          name="defaultPayoutMethod"
                          checked={payoutData.defaultPayoutMethod === m.id}
                          onChange={() => setPayoutData({ ...payoutData, defaultPayoutMethod: m.id })}
                          className="accent-blue-600 h-4 w-4"
                        />
                      </div>
                      <p className="text-[11px] text-muted mt-1">{m.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* 1. Crypto Method Box (Only shown if Admin enabled CRYPTO) */}
              {enabledMethods.CRYPTO && (
                <div className={`p-4 rounded-xl border space-y-3 ${payoutData.defaultPayoutMethod === 'CRYPTO' ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20' : 'border-gray-200 dark:border-slate-800'}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">⚡ Crypto Wallet</span>
                    {payoutData.defaultPayoutMethod === 'CRYPTO' && (
                      <Badge variant="success" className="text-[10px]">Active Default</Badge>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Network / Token</label>
                    <Input
                      value={payoutData.cryptoNetwork}
                      placeholder="e.g. USDT (BEP-20)"
                      onChange={e => setPayoutData({ ...payoutData, cryptoNetwork: e.target.value })}
                      className="text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Wallet Address</label>
                    <Input
                      value={payoutData.cryptoWalletAddress}
                      placeholder="0x..."
                      onChange={e => setPayoutData({ ...payoutData, cryptoWalletAddress: e.target.value })}
                      className="text-xs py-2 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 2. Banking Method Box (Only shown if Admin enabled BANKING) */}
              {enabledMethods.BANKING && (
                <div className={`p-4 rounded-xl border space-y-3 ${payoutData.defaultPayoutMethod === 'BANKING' ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20' : 'border-gray-200 dark:border-slate-800'}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">🏦 Bank Account</span>
                    {payoutData.defaultPayoutMethod === 'BANKING' && (
                      <Badge variant="success" className="text-[10px]">Active Default</Badge>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Bank Name</label>
                    <Input
                      value={payoutData.bankName}
                      placeholder="e.g. HDFC Bank"
                      onChange={e => setPayoutData({ ...payoutData, bankName: e.target.value })}
                      className="text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Account Holder Name</label>
                    <Input
                      value={payoutData.bankAccountName}
                      placeholder="Name on account"
                      onChange={e => setPayoutData({ ...payoutData, bankAccountName: e.target.value })}
                      className="text-xs py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Account Number</label>
                    <Input
                      value={payoutData.bankAccountNumber}
                      placeholder="Account number"
                      onChange={e => setPayoutData({ ...payoutData, bankAccountNumber: e.target.value })}
                      className="text-xs py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">IFSC Code</label>
                    <Input
                      value={payoutData.bankIfscCode}
                      placeholder="IFSC Code (e.g. HDFC0001234)"
                      onChange={e => setPayoutData({ ...payoutData, bankIfscCode: e.target.value })}
                      className="text-xs py-2 uppercase font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 3. UPI Method Box (Only shown if Admin enabled UPI) */}
              {enabledMethods.UPI && (
                <div className={`p-4 rounded-xl border space-y-3 ${payoutData.defaultPayoutMethod === 'UPI' ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20' : 'border-gray-200 dark:border-slate-800'}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">📱 UPI Payment</span>
                    {payoutData.defaultPayoutMethod === 'UPI' && (
                      <Badge variant="success" className="text-[10px]">Active Default</Badge>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">UPI ID / VPA</label>
                    <Input
                      value={payoutData.upiId}
                      placeholder="e.g. username@upi or 9876543210@paytm"
                      onChange={e => setPayoutData({ ...payoutData, upiId: e.target.value })}
                      className="text-xs py-2 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {payoutMsg && (
              <div className={`p-3 rounded-xl text-xs font-medium ${payoutStatus === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                {payoutMsg}
              </div>
            )}

            <Button type="submit" className="w-full sm:w-auto px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5" disabled={payoutLoading || availableMethods.length === 0}>
              {payoutLoading ? 'Saving Payout Methods...' : 'Save Receiving Payment Methods'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
