'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface InvestmentItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    status: string;
    sponsor?: { username: string };
  };
  amount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  createdAt: string;
  planVersion?: {
    version: number;
    config: any;
  };
  roiTransactions?: Array<{ amount: number; createdAt: string }>;
}

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [selectedInv, setSelectedInv] = useState<InvestmentItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetUser, setTargetUser] = useState('');
  const [packageAmount, setPackageAmount] = useState('100');
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/investments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setInvestments(data.investments || []);
        setStats(data.stats || {});
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (e) {
      console.error('Fetch admin investments error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInvestments();
  };

  const handleAdminCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg({ text: '', type: '' });

    if (!targetUser.trim()) {
      setToastMsg({ text: 'Please enter target username, email or User ID', type: 'error' });
      return;
    }

    if (!packageAmount || Number(packageAmount) <= 0) {
      setToastMsg({ text: 'Please enter a valid positive investment amount', type: 'error' });
      return;
    }

    setSubmittingAdd(true);
    try {
      const res = await fetch('/api/admin/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrId: targetUser.trim(),
          amount: Number(packageAmount),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMsg({ text: `🎉 Package activated successfully for @${targetUser.trim()}!`, type: 'success' });
        setTargetUser('');
        setPackageAmount('100');
        fetchInvestments();
        setTimeout(() => {
          setShowAddModal(false);
          setToastMsg({ text: '', type: '' });
        }, 1500);
      } else {
        setToastMsg({ text: data.error || 'Failed to activate package', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ text: 'Network error activating package', type: 'error' });
    } finally {
      setSubmittingAdd(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    invId: string;
    newStatus: string;
    message: string;
  }>({ isOpen: false, invId: '', newStatus: '', message: '' });

  const requestUpdateStatus = (invId: string, newStatus: string) => {
    setConfirmModal({
      isOpen: true,
      invId,
      newStatus,
      message: `Are you sure you want to change investment status to ${newStatus}?`,
    });
  };

  const handleUpdateStatus = async (invId: string, newStatus: string) => {
    setStatusUpdatingId(invId);
    try {
      const res = await fetch(`/api/admin/investments/${invId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchInvestments();
        if (selectedInv?.id === invId) {
          setSelectedInv(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const statusVariant = (status: string): 'success' | 'default' | 'danger' | 'info' | 'warning' => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>💰 System Investments Overview</span>
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Master control console to monitor, search, audit, filter, and manually activate or manage user investment packages across the entire platform.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" className="text-xs py-2 px-4 shadow-md shrink-0">
          ➕ Admin Activate Package
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border">
          <CardDescription className="text-xs text-muted font-medium">Total Platform Capital</CardDescription>
          <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            ${Number(stats.totalInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <p className="text-[11px] text-muted mt-1">All time investments deposited</p>
        </Card>

        <Card className="p-4 border-border">
          <CardDescription className="text-xs text-muted font-medium">Active Investments</CardDescription>
          <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.activeCount || 0}
          </CardTitle>
          <p className="text-[11px] text-muted mt-1">{stats.completedCount || 0} completed • {stats.cancelledCount || 0} cancelled</p>
        </Card>

        <Card className="p-4 border-border">
          <CardDescription className="text-xs text-muted font-medium">Total ROI Distributed</CardDescription>
          <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            ${Number(stats.totalRoi || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <p className="text-[11px] text-muted mt-1">Total daily ROI paid to users</p>
        </Card>

        <Card className="p-4 border-border">
          <CardDescription className="text-xs text-muted font-medium">Active Plan Version</CardDescription>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            v{stats.activePlanVersion || 1}
          </CardTitle>
          <p className="text-[11px] text-muted mt-1">System ROI plan engine version</p>
        </Card>
      </div>

      {/* Filter & Control Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'ALL' ? 'All Investments' : st}
              </button>
            ))}
          </div>

          {/* Live Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
            <Input
              type="text"
              placeholder="Search user, @username, email or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs py-2 bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white"
            />
            <Button type="submit" variant="outline" size="sm" className="text-xs py-2 px-3 shrink-0">
              🔍 Search
            </Button>
          </form>
        </div>
      </Card>

      {/* Main Investments Table */}
      <Card>
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">All System Investments ({totalCount})</CardTitle>
            <CardDescription className="text-xs text-muted">Page {page} of {totalPages}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3">Investment ID</th>
                  <th className="p-3">User & Sponsor</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Daily ROI</th>
                  <th className="p-3">Earned ROI / Cap</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                      Loading investments records...
                    </td>
                  </tr>
                ) : investments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted">
                      <p className="text-2xl mb-1">💰</p>
                      <p className="text-sm font-semibold">No investment records found</p>
                      <p className="text-xs mt-0.5">Try adjusting your search query or status filter.</p>
                    </td>
                  </tr>
                ) : (
                  investments.map((inv) => {
                    const earnedRoi = inv.roiTransactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
                    const roiPercent = inv.planVersion?.config?.dailyRoiPercent || 0.5;
                    const maxCapMultiple = inv.planVersion?.config?.maxRoiCapMultiple || 3;
                    const maxCapAmount = Number(inv.amount) * maxCapMultiple;
                    const progressPercent = Math.min(100, Math.round((earnedRoi / (maxCapAmount || 1)) * 100));

                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-gray-900 dark:text-slate-200">
                          {inv.id.substring(0, 8)}...
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {inv.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{inv.user?.name}</p>
                              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-mono">
                                @{inv.user?.username} {inv.user?.sponsor?.username ? `(Sponsor: @${inv.user.sponsor.username})` : ''}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-bold text-sm text-gray-900 dark:text-white">
                          ${Number(inv.amount).toFixed(2)}
                        </td>

                        <td className="p-3">
                          <Badge variant={statusVariant(inv.status)} className="text-[10px]">
                            {inv.status}
                          </Badge>
                        </td>

                        <td className="p-3 text-gray-600 dark:text-slate-400 text-[11px]">
                          {new Date(inv.startDate).toLocaleDateString()} {new Date(inv.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">
                          {roiPercent}% / day
                        </td>

                        <td className="p-3">
                          <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">${earnedRoi.toFixed(2)}</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500"> / ${maxCapAmount.toFixed(2)}</span>
                          </div>
                          <div className="w-24 bg-gray-200 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 px-2"
                              onClick={() => setSelectedInv(inv)}
                              title="View Investment Details"
                            >
                              👁️ Details
                            </Button>

                            {inv.status === 'ACTIVE' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[11px] h-7 px-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                disabled={statusUpdatingId === inv.id}
                                onClick={() => requestUpdateStatus(inv.id, 'CANCELLED')}
                                title="Cancel Investment"
                              >
                                🛑 Cancel
                              </Button>
                            )}

                            {inv.status === 'CANCELLED' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[11px] h-7 px-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                disabled={statusUpdatingId === inv.id}
                                onClick={() => requestUpdateStatus(inv.id, 'ACTIVE')}
                                title="Reactivate Investment"
                              >
                                ▶️ Reactivate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-xs text-muted">Showing page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="text-xs"
                >
                  ◀ Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="text-xs"
                >
                  Next ▶
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Details Modal */}
      {selectedInv && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-gray-900 dark:text-white relative my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span>💰 Investment Details</span>
                  <Badge variant={statusVariant(selectedInv.status)}>{selectedInv.status}</Badge>
                </h2>
                <p className="text-xs text-muted font-mono mt-0.5">ID: {selectedInv.id}</p>
              </div>
              <button 
                onClick={() => setSelectedInv(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-muted block">Investor Name:</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedInv.user?.name}</span>
                <span className="text-[10px] text-muted block font-mono">@{selectedInv.user?.username}</span>
              </div>
              <div>
                <span className="text-muted block">Investor Email:</span>
                <span className="font-medium text-gray-900 dark:text-white truncate block">{selectedInv.user?.email}</span>
              </div>
              <div>
                <span className="text-muted block">Package Amount:</span>
                <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">${Number(selectedInv.amount).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted block">Sponsor Username:</span>
                <span className="font-medium text-gray-900 dark:text-white">@{selectedInv.user?.sponsor?.username || 'None'}</span>
              </div>
              <div>
                <span className="text-muted block">Start Date:</span>
                <span className="font-medium">{new Date(selectedInv.startDate).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted block">Plan Engine:</span>
                <span className="font-medium">Version v{selectedInv.planVersion?.version || 1}</span>
              </div>
            </div>

            {/* ROI Payout Progress */}
            <div className="space-y-1 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/20 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800 dark:text-slate-200">ROI Cap Earnings</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${(selectedInv.roiTransactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0).toFixed(2)} / ${(Number(selectedInv.amount) * (selectedInv.planVersion?.config?.maxRoiCapMultiple || 3)).toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-muted">
                Daily ROI Rate: <strong>{selectedInv.planVersion?.config?.dailyRoiPercent || 0.5}%</strong> • Max Return Cap: <strong>{(selectedInv.planVersion?.config?.maxRoiCapMultiple || 3) * 100}%</strong>
              </p>
            </div>

            {/* ROI Payout History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Recent ROI Payouts ({selectedInv.roiTransactions?.length || 0})</h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {(!selectedInv.roiTransactions || selectedInv.roiTransactions.length === 0) ? (
                  <p className="text-xs text-muted py-3 text-center">No daily ROI payouts recorded yet.</p>
                ) : (
                  selectedInv.roiTransactions.map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-800 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">+${Number(tx.amount).toFixed(2)} ROI</span>
                      <span className="text-[10px] text-muted">{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-800">
              <Button size="sm" variant="outline" onClick={() => setSelectedInv(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Activate Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-gray-900 dark:text-white relative my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>⚡ Admin Activate Package / Top-Up</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {toastMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-medium ${toastMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'}`}>
                {toastMsg.text}
              </div>
            )}

            <form onSubmit={handleAdminCreatePackage} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Target User (Username, Email or ID)</label>
                <Input 
                  type="text" 
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  placeholder="e.g. johndoe, john@example.com"
                  className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Investment Package Amount ($)</label>
                <Input 
                  type="number" 
                  value={packageAmount}
                  onChange={(e) => setPackageAmount(e.target.value)}
                  placeholder="e.g. 50, 100, 500, 1000"
                  className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs font-bold"
                  required
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-bold">ℹ️ Administrative Direct Activation Rule:</p>
                <p>Activating this investment package will mark the target user status as <strong>ACTIVE</strong>, update platform BusinessVolume, and begin daily ROI generation automatically.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submittingAdd}>
                  {submittingAdd ? 'Activating Package...' : '⚡ Activate Package'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Confirm Status Change"
        message={confirmModal.message}
        variant={confirmModal.newStatus === 'CANCELLED' ? 'danger' : 'warning'}
        confirmText={confirmModal.newStatus === 'CANCELLED' ? 'Yes, Cancel' : 'Yes, Reactivate'}
        cancelText="Keep Current"
        onConfirm={() => {
          const { invId, newStatus } = confirmModal;
          setConfirmModal({ isOpen: false, invId: '', newStatus: '', message: '' });
          handleUpdateStatus(invId, newStatus);
        }}
        onCancel={() => setConfirmModal({ isOpen: false, invId: '', newStatus: '', message: '' })}
      />
    </div>
  );
}
