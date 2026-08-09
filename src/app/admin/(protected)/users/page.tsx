'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Decimal from 'decimal.js';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [activateUser, setActivateUser] = useState<any | null>(null);
  const [investAmount, setInvestAmount] = useState('50');
  const [submittingInvest, setSubmittingInvest] = useState(false);
  const [investError, setInvestError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdminInvestment = async () => {
    if (!activateUser) return;
    setSubmittingInvest(true);
    setInvestError(null);
    try {
      const res = await fetch(`/api/admin/users/${activateUser.id}/invest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(investAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setActivateUser(null);
        setInvestAmount('50');
        fetchUsers();
      } else {
        setInvestError(data.error || 'Failed to activate investment');
      }
    } catch (e: any) {
      setInvestError(e.message || 'An error occurred');
    } finally {
      setSubmittingInvest(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      
      <div className="flex space-x-4">
        <Input 
          placeholder="Search name, username, email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <select 
          className="border rounded-md px-3 py-2"
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Contact</th>
                <th className="p-4 text-left">Sponsor</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Directs</th>
                <th className="p-4 text-left">Self Investment</th>
                <th className="p-4 text-left">Team Investment</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const effectiveStatus = u.status === 'SUSPENDED' 
                  ? 'SUSPENDED' 
                  : u.status === 'BANNED' 
                  ? 'BANNED' 
                  : (u.status === 'ACTIVE' && (u.selfInvestmentSum > 0 || u.activeInvestmentsSum > 0)) 
                  ? 'ACTIVE' 
                  : 'INACTIVE';

                return (
                  <tr key={u.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-gray-500">@{u.username}</div>
                    </td>
                    <td className="p-4">
                      <div>{u.email}</div>
                      <div className="text-sm text-gray-500">{u.referralCode}</div>
                    </td>
                    <td className="p-4">{u.sponsor?.username || '-'}</td>
                    <td className="p-4">
                      <Badge variant={effectiveStatus === 'ACTIVE' ? 'success' : effectiveStatus === 'SUSPENDED' ? 'danger' : 'warning'}>
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
                          className={effectiveStatus === 'ACTIVE' ? "bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3" : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3"}
                          onClick={() => {
                            setActivateUser(u);
                            setInvestAmount('50');
                            setInvestError(null);
                          }}
                        >
                          {effectiveStatus === 'ACTIVE' ? 'Invest' : 'Activate'}
                        </Button>

                        {u.status === 'SUSPENDED' ? (
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(u.id, 'ACTIVE')}>Unsuspend</Button>
                        ) : (
                          <Button variant="danger" size="sm" onClick={() => handleStatusChange(u.id, 'SUSPENDED')}>Suspend</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex justify-between items-center border-t">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </Card>

      {/* Activate User / Investment Modal */}
      {mounted && activateUser && require('react-dom').createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[99999] backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>⚡ Activate Account / Create Investment</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target User: <strong className="text-emerald-400">{activateUser.name}</strong> (@{activateUser.username})
                </p>
              </div>
              <button 
                onClick={() => setActivateUser(null)} 
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {investError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-xs">
                ⚠️ {investError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Investment Amount (USDT)
              </label>
              <Input 
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder="Enter amount (e.g. 50, 100, 500)"
                className="w-full text-base py-3 bg-slate-950 border-slate-700 text-white"
              />
              <p className="text-[11px] text-slate-400">
                Minimum: $5 (Multiples of $5). Submitting will create an active investment and mark this user account as <strong className="text-emerald-400">ACTIVE</strong>.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setActivateUser(null)}
                disabled={submittingInvest}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                onClick={handleAdminInvestment}
                disabled={submittingInvest}
              >
                {submittingInvest ? 'Processing...' : 'Confirm Activation'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
