'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [statusTab, setStatusTab] = useState('PENDING');
  const [adminNote, setAdminNote] = useState('');
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);

  const fetchDeposits = async () => {
    try {
      // Assuming a GET endpoint exists or will be created
      const res = await fetch(`/api/admin/deposits?status=${statusTab === 'ALL' ? '' : statusTab}`);
      if (res.ok) {
        const data = await res.json();
        setDeposits(data.deposits || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [statusTab]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const body: any = { action };
      if (action === 'reject') {
        body.adminNote = adminNote;
      }
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchDeposits();
        setSelectedDepositId(null);
        setAdminNote('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deposit Management</h1>

      <div className="flex space-x-2 border-b">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(tab => (
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
                <th className="p-4 text-left">Method</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="p-4 text-sm">{d.id.substring(0, 8)}</td>
                  <td className="p-4">
                    <div>{d.user?.name}</div>
                    <div className="text-sm text-gray-500">@{d.user?.username}</div>
                  </td>
                  <td className="p-4">${Number(d.amount).toFixed(2)}</td>
                  <td className="p-4">{d.method}</td>
                  <td className="p-4"><Badge>{d.status}</Badge></td>
                  <td className="p-4">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 space-x-2 flex">
                    {d.proofUrl && (
                      <Button variant="outline" size="sm" onClick={() => window.open(d.proofUrl, '_blank')}>
                        Proof
                      </Button>
                    )}
                    {d.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={() => handleAction(d.id, 'approve')}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => setSelectedDepositId(d.id)}>Reject</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedDepositId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Reject Deposit</h3>
            <Input 
              placeholder="Reason for rejection" 
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedDepositId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleAction(selectedDepositId, 'reject')}>Confirm Reject</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
