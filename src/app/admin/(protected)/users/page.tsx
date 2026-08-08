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
                <th className="p-4 text-left">Investment</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
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
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="p-4">{u._count?.downlines || 0}</td>
                  <td className="p-4">${u.activeInvestmentsSum?.toFixed(2)}</td>
                  <td className="p-4 space-x-2">
                    {u.status === 'ACTIVE' ? (
                      <Button variant="danger" size="sm" onClick={() => handleStatusChange(u.id, 'SUSPENDED')}>Suspend</Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleStatusChange(u.id, 'ACTIVE')}>Activate</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex justify-between items-center border-t">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </Card>
    </div>
  );
}
