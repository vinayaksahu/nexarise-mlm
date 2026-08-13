'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [statusTab, setStatusTab] = useState('PENDING');
  const [adminNote, setAdminNote] = useState('');
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch(`/api/admin/withdrawals?status=${statusTab === 'ALL' ? '' : statusTab}`);
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(Array.isArray(data) ? data : (data.withdrawals || []));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [statusTab]);

  const handleAction = async (id: string, action: 'approve' | 'paid' | 'reject') => {
    try {
      let status = '';
      if (action === 'approve') status = 'APPROVED';
      else if (action === 'paid') status = 'PAID';
      else if (action === 'reject') status = 'REJECTED';

      const body: any = { status, adminNote };
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchWithdrawals();
        setSelectedWithdrawalId(null);
        setAdminNote('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPayoutDetails = (w: any) => {
    const user = w.user;
    const methodType = user?.defaultPayoutMethod || 'CRYPTO';

    if (methodType === 'BANKING' && (user?.bankName || user?.bankAccountNumber)) {
      return {
        type: 'BANKING',
        badge: '🏦 BANKING',
        details: `${user.bankName || 'Bank'} - Acc: ${user.bankAccountNumber || 'N/A'} (Holder: ${user.bankAccountName || 'N/A'}, IFSC: ${user.bankIfscCode || 'N/A'})`,
      };
    }

    if (methodType === 'UPI' && user?.upiId) {
      return {
        type: 'UPI',
        badge: '📱 UPI',
        details: `UPI ID: ${user.upiId}`,
      };
    }

    // Fallback to CRYPTO or w.method
    return {
      type: 'CRYPTO',
      badge: '⚡ CRYPTO',
      details: user?.cryptoWalletAddress
        ? `${user.cryptoNetwork || 'USDT (BEP-20)'}: ${user.cryptoWalletAddress}`
        : w.method || 'USDT (BEP-20)',
    };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Withdrawal Management</h1>

      <div className="flex space-x-2 border-b">
        {['PENDING', 'APPROVED', 'PAID', 'REJECTED', 'ALL'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 ${statusTab === tab ? 'border-b-2 border-primary font-bold' : ''}`}
            onClick={() => setStatusTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted">
                <th className="p-4">ID</th>
                <th className="p-4">User Details</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Fee</th>
                <th className="p-4">Net Payout</th>
                <th className="p-4">Active Default Payout Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date / Time</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-muted">No withdrawal requests found</td>
                </tr>
              ) : (
                withdrawals.map(w => {
                  const payout = getPayoutDetails(w);
                  return (
                    <tr key={w.id} className="border-b hover:bg-muted/10">
                      <td className="p-4 text-xs font-mono text-muted">{w.id.substring(0, 8)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{w.user?.name || 'User'}</div>
                        <div className="text-xs text-muted">@{w.user?.username || 'user'}</div>
                        {w.user?.email && <div className="text-[11px] text-muted truncate">{w.user.email}</div>}
                      </td>
                      <td className="p-4 font-semibold">${Number(w.amount).toFixed(2)}</td>
                      <td className="p-4 text-xs text-muted">${Number(w.fee).toFixed(2)}</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">${Number(w.netAmount).toFixed(2)}</td>
                      <td className="p-4 text-xs max-w-[260px]">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {payout.badge}
                          </span>
                          <div className="font-mono text-[11px] break-all text-gray-900 dark:text-slate-200">
                            {payout.details}
                          </div>
                          {w.method && w.method !== payout.details && (
                            <div className="text-[10px] text-muted truncate">
                              Submitted: {w.method}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={w.status === 'APPROVED' || w.status === 'PAID' ? 'success' : w.status === 'PENDING' ? 'warning' : 'danger'}>
                          {w.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-muted">{new Date(w.createdAt).toLocaleString()}</td>
                      <td className="p-4 space-x-2">
                        {w.status === 'PENDING' && (
                          <>
                            <Button size="sm" variant="primary" onClick={() => handleAction(w.id, 'approve')}>Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => setSelectedWithdrawalId(w.id)}>Reject</Button>
                          </>
                        )}
                        {w.status === 'APPROVED' && (
                          <Button size="sm" variant="primary" onClick={() => handleAction(w.id, 'paid')}>Mark Paid</Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedWithdrawalId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Withdrawal</h3>
            <p className="text-xs text-muted">The amount will be automatically refunded to the user's wallet.</p>
            <Input 
              placeholder="Reason for rejection" 
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedWithdrawalId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleAction(selectedWithdrawalId, 'reject')}>Confirm Reject</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
