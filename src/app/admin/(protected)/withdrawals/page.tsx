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
              <tr className="border-b">
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Fee</th>
                <th className="p-4 text-left">Net</th>
                <th className="p-4 text-left">Receiving Address / Method</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date / Time</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} className="border-b">
                  <td className="p-4 text-sm font-mono">{w.id.substring(0, 8)}</td>
                  <td className="p-4">
                    <div className="font-semibold">{w.user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">@{w.user?.username || 'user'}</div>
                  </td>
                  <td className="p-4 font-semibold">${Number(w.amount).toFixed(2)}</td>
                  <td className="p-4 text-xs text-slate-400">${Number(w.fee).toFixed(2)}</td>
                  <td className="p-4 font-bold text-emerald-500">${Number(w.netAmount).toFixed(2)}</td>
                  <td className="p-4 text-xs font-mono break-all max-w-[200px]">{w.method || 'USDT (BEP-20)'}</td>
                  <td className="p-4"><Badge variant={w.status === 'APPROVED' || w.status === 'PAID' ? 'success' : w.status === 'PENDING' ? 'warning' : 'danger'}>{w.status}</Badge></td>
                  <td className="p-4 text-xs text-slate-400">{new Date(w.createdAt).toLocaleString()}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedWithdrawalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Reject Withdrawal</h3>
            <p className="text-sm text-gray-500">The amount will be automatically refunded to the user's wallet.</p>
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
