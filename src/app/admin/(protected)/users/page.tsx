'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Promotional Activation Modal State
  const [activateUser, setActivateUser] = useState<any | null>(null);
  const [amount, setAmount] = useState('0');
  const [reason, setReason] = useState('Team Leader Special Activation');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams({ search, status, page: page.toString() });
      const res = await fetch(`/api/admin/users?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, status, page]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast('success', 'User status updated');
        fetchUsers();
      } else {
        showToast('error', 'Failed to update user status');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Network error updating user status');
    }
  };

  const handleCreatePromotionalActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activateUser) return;
    if (!reason.trim()) {
      setPromoError('Activation reason is required');
      return;
    }

    setSubmitting(true);
    setPromoError(null);

    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activateUser.id,
          amount: Number(amount || 0),
          reason: reason.trim(),
          notes: notes.trim() || undefined,
          startDate: startDate || undefined,
          expiryDate: expiryDate || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', `Promotional activation created for ${activateUser.name}!`);
        setActivateUser(null);
        setAmount('0');
        setReason('Team Leader Special Activation');
        setNotes('');
        setStartDate('');
        setExpiryDate('');
        fetchUsers();
      } else {
        setPromoError(data.error || 'Failed to activate promotional status');
      }
    } catch (e: any) {
      setPromoError(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-[100000] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium transition-all ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-600 text-white border border-emerald-500' 
            : 'bg-red-600 text-white border border-red-500'
        }`}>
          <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 font-bold hover:opacity-80">✕</button>
        </div>
      )}

      <h1 className="text-2xl font-bold">User Management</h1>
      
      <div className="flex space-x-4">
        <Input 
          placeholder="Search name, username, email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <select 
          className="border rounded-md px-3 py-2 bg-white dark:bg-slate-900 border-border text-sm"
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-left">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Sponsor</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Directs</th>
                <th className="p-4 font-semibold">Self Investment</th>
                <th className="p-4 font-semibold">Team Investment</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const effectiveStatus = u.status === 'SUSPENDED' 
                  ? 'SUSPENDED' 
                  : u.status === 'BANNED' 
                  ? 'BANNED' 
                  : (u.status === 'ACTIVE' && (u.selfInvestmentSum > 0 || u.activeInvestmentsSum > 0 || u.hasPromotionalActivation)) 
                  ? 'ACTIVE' 
                  : 'INACTIVE';

                return (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-primary font-mono">@{u.username}</div>
                    </td>
                    <td className="p-4">
                      <div>{u.email}</div>
                      <div className="text-xs text-slate-500">{u.referralCode}</div>
                    </td>
                    <td className="p-4">{u.sponsor?.username || '-'}</td>
                    <td className="p-4">
                      <Badge variant={effectiveStatus === 'ACTIVE' ? 'success' : effectiveStatus === 'SUSPENDED' ? 'danger' : 'default'}>
                        {effectiveStatus}
                      </Badge>
                    </td>
                    <td className="p-4">{u._count?.downlines || 0}</td>
                    <td className="p-4 font-semibold text-emerald-500">${(u.selfInvestmentSum || 0).toFixed(2)}</td>
                    <td className="p-4 font-semibold text-indigo-400">${(u.teamInvestmentSum || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className={effectiveStatus === 'ACTIVE' ? "bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 text-xs" : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 text-xs"}
                          onClick={() => {
                            setActivateUser(u);
                            setAmount('0');
                            setReason('Team Leader Special Activation');
                            setNotes('');
                            setStartDate('');
                            setExpiryDate('');
                            setPromoError(null);
                          }}
                        >
                          {effectiveStatus === 'ACTIVE' ? '🎁 Promote' : '🎁 Activate'}
                        </Button>

                        {!['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'].includes(u.role) && (
                          u.status === 'SUSPENDED' ? (
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => handleStatusChange(u.id, 'ACTIVE')}>Unsuspend</Button>
                          ) : (
                            <Button variant="danger" size="sm" className="text-xs" onClick={() => handleStatusChange(u.id, 'SUSPENDED')}>Suspend</Button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex justify-between items-center border-t border-border text-xs">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline" size="sm">Previous</Button>
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} variant="outline" size="sm">Next</Button>
        </div>
      </Card>

      {/* Promotional Activation Modal (Replaces old investment modal) */}
      {mounted && activateUser && require('react-dom').createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[99999] backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>🎁 New Promotional Activation</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Activate account status without creating fake investments or inflating business volume.
                </p>
              </div>
              <button 
                onClick={() => setActivateUser(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {promoError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400 text-xs">
                ⚠️ {promoError}
              </div>
            )}

            <form onSubmit={handleCreatePromotionalActivation} className="space-y-3.5 text-xs">
              {/* Target User Info */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg">
                <div className="text-xs text-slate-500 font-medium">Target User</div>
                <div className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">{activateUser.name}</div>
                <div className="text-xs text-primary font-mono">@{activateUser.username} ({activateUser.email})</div>
              </div>

              {/* Activation Amount ($) */}
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700 dark:text-slate-300">
                  Activation Amount ($) (Optional / Nominal)
                </label>
                <Input 
                  type="number"
                  placeholder="e.g. 0, 50, 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="any"
                  className="w-full text-sm"
                />
                <p className="text-[11px] text-slate-500">
                  Recorded for promotional reference. Does NOT generate fake investments or inflate Actual Business.
                </p>
              </div>

              {/* Activation Reason */}
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700 dark:text-slate-300">
                  Activation Reason <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="e.g. Team Leader Special Activation, Founding Member Promo"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full text-sm"
                />
              </div>

              {/* Start & Expiry Date */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-semibold text-gray-700 dark:text-slate-300">Start Date</label>
                  <Input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-gray-700 dark:text-slate-300">Expiry Date</label>
                  <Input 
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700 dark:text-slate-300">Admin Internal Notes</label>
                <textarea 
                  className="w-full p-2 bg-white dark:bg-slate-950 border border-border rounded-md text-xs min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add any internal context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] text-blue-800 dark:text-blue-300">
                ℹ️ <strong>Protection Guarantee:</strong> Submitting will mark this account as <strong>ACTIVE</strong> without generating any deposit, investment, wallet balance, or Business Volume.
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setActivateUser(null)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  disabled={submitting}
                >
                  {submitting ? 'Activating...' : 'Confirm Activation'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
