'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PromotionRecord {
  id: string;
  amount?: number | string;
  reason: string;
  notes: string | null;
  startDate: string;
  expiryDate: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    status: string;
  };
  createdBy: {
    id: string;
    name: string;
    username: string;
  } | null;
}

interface UserOption {
  id: string;
  name: string;
  username: string;
  email: string;
  status: string;
}

export default function AdminPromotionalActivationsPage() {
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('0');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status: statusFilter, page: page.toString(), limit: '10' });
      const res = await fetch(`/api/admin/promotions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPromotions(data.promotions);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      } else {
        showToast('error', 'Failed to load promotional activation records');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Network error loading promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [search, statusFilter, page]);

  // Search users for modal
  useEffect(() => {
    if (!showCreateModal) return;
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/promotions/users?search=${encodeURIComponent(userQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setUserOptions(data.users || []);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [userQuery, showCreateModal]);

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast('error', 'Please select a user to activate');
      return;
    }
    if (!reason.trim()) {
      showToast('error', 'Activation reason is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: Number(amount || 0),
          reason: reason.trim(),
          notes: notes.trim() || undefined,
          startDate: startDate || undefined,
          expiryDate: expiryDate || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', `Promotional activation created for ${selectedUser.name}!`);
        setShowCreateModal(false);
        // Reset form
        setSelectedUser(null);
        setUserQuery('');
        setAmount('0');
        setReason('');
        setNotes('');
        setStartDate('');
        setExpiryDate('');
        fetchPromotions();
      } else {
        showToast('error', data.error || 'Failed to create promotional activation');
      }
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (promoId: string, currentStatus: string) => {
    const action = currentStatus === 'ACTIVE' ? 'deactivate' : 'activate';
    setActionLoadingId(promoId);
    try {
      const res = await fetch(`/api/admin/promotions/${promoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', `Status updated to ${action === 'activate' ? 'ACTIVE' : 'INACTIVE'}`);
        fetchPromotions();
      } else {
        showToast('error', data.error || 'Failed to update status');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeCount = promotions.filter(p => p.status === 'ACTIVE').length;
  const totalPromoValue = promotions.reduce((sum, p) => sum + Number(p.amount || 0), 0);

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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🎁 Promotional Activations</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Activate team leaders and promotional accounts without inflating actual business volume or creating fake investments.
          </p>
        </div>
        <Button 
          variant="primary" 
          className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-md flex items-center gap-2 text-white"
          onClick={() => {
            setShowCreateModal(true);
            setSelectedUser(null);
            setUserQuery('');
            setAmount('0');
            setReason('');
            setNotes('');
            setStartDate('');
            setExpiryDate('');
          }}
        >
          <span>✨ Create Promotional Activation</span>
        </Button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-border shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Promotional Records</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Historical promotional activations created</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-border shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">Active Promotional Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Currently active without fake investments</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-border shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs text-indigo-500 font-medium uppercase tracking-wider">Promotional Value</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${totalPromoValue.toFixed(2)}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Actual Business Inflation: $0.00</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input 
              placeholder="Search user name, username, email or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <select 
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900 border-border"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </Card>

      {/* Main Records Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-left">
                <th className="p-3.5 font-semibold">User</th>
                <th className="p-3.5 font-semibold">Activation Amount</th>
                <th className="p-3.5 font-semibold">Reason</th>
                <th className="p-3.5 font-semibold">Start Date</th>
                <th className="p-3.5 font-semibold">Expiry Date</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Created By</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                    Loading promotional activations...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <p className="text-3xl mb-2">🎁</p>
                    <p className="font-semibold">No promotional activation records found</p>
                    <p className="text-xs text-slate-500 mt-1">Click "Create Promotional Activation" above to add one.</p>
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id} className="border-b border-border/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white">{promo.user.name}</div>
                      <div className="text-xs text-primary font-mono">@{promo.user.username}</div>
                      <div className="text-xs text-slate-400">{promo.user.email}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ${Number(promo.amount || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 max-w-[220px]">
                      <div className="font-medium text-gray-800 dark:text-gray-200 truncate" title={promo.reason}>{promo.reason}</div>
                      {promo.notes && (
                        <div className="text-xs text-slate-400 truncate mt-0.5" title={promo.notes}>
                          📝 {promo.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {new Date(promo.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <Badge variant={promo.status === 'ACTIVE' ? 'success' : promo.status === 'EXPIRED' ? 'warning' : 'default'}>
                        {promo.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {promo.createdBy ? `@${promo.createdBy.username}` : 'System'}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={promo.status === 'ACTIVE' ? 'danger' : 'outline'}
                        className="text-xs h-8 px-3"
                        disabled={actionLoadingId === promo.id}
                        onClick={() => handleToggleStatus(promo.id, promo.status)}
                      >
                        {actionLoadingId === promo.id ? (
                          'Updating...'
                        ) : promo.status === 'ACTIVE' ? (
                          '⏸ Deactivate'
                        ) : (
                          '▶ Activate'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 flex justify-between items-center border-t border-border text-xs">
          <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)} variant="outline" size="sm">
            Previous
          </Button>
          <span className="text-slate-500">
            Page {page} of {totalPages} ({totalCount} total)
          </span>
          <Button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} variant="outline" size="sm">
            Next
          </Button>
        </div>
      </Card>

      {/* Modal: Create Promotional Activation */}
      {mounted && showCreateModal && require('react-dom').createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[99999] backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
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
                onClick={() => setShowCreateModal(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePromotion} className="space-y-4 text-sm">
              {/* User Selection with Search Dropdown */}
              <div className="space-y-1 relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Select User <span className="text-red-500">*</span>
                </label>
                {selectedUser ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedUser.name}</span>
                      <span className="text-xs text-primary font-mono ml-2">@{selectedUser.username}</span>
                      <div className="text-xs text-slate-500">{selectedUser.email}</div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7 px-2"
                      onClick={() => { setSelectedUser(null); setUserQuery(''); }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      placeholder="Type name, username or email to search user..."
                      value={userQuery}
                      onChange={(e) => {
                        setUserQuery(e.target.value);
                        setUserDropdownOpen(true);
                      }}
                      onFocus={() => setUserDropdownOpen(true)}
                    />
                    {userDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-900 border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {userOptions.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">No matching users found</div>
                        ) : (
                          userOptions.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              className="w-full text-left p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-border/40 last:border-0 flex items-center justify-between"
                              onClick={() => {
                                setSelectedUser(u);
                                setUserDropdownOpen(false);
                              }}
                            >
                              <div>
                                <div className="font-semibold text-xs">{u.name} (@{u.username})</div>
                                <div className="text-[11px] text-slate-400">{u.email}</div>
                              </div>
                              <Badge variant={u.status === 'ACTIVE' ? 'success' : 'default'} className="text-[10px]">
                                {u.status}
                              </Badge>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Activation Amount ($) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Activation Amount ($) (Optional / Nominal)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 0, 50, 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="any"
                />
                <p className="text-[11px] text-slate-500">
                  Recorded for promotional reference. Does NOT generate fake investments or inflate Actual Business.
                </p>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Activation Reason <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Team Leader Special Activation, Founding Member Promo"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              {/* Start & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Start Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Expiry Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Admin Internal Notes (Optional)
                </label>
                <textarea
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-border rounded-md text-xs min-h-[70px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add any internal context or administrative details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                ℹ️ <strong>Protection Guarantee:</strong> Submitting will mark this account as <strong>ACTIVE</strong> without generating any deposit, investment, wallet balance, or Business Volume.
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
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
