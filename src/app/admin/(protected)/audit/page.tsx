'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [tab, setTab] = useState<'AUDIT' | 'SECURITY'>('AUDIT');
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/audit');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.auditLogs || []);
          setSecurityEvents(data.securityEvents || []);
        } else if (res.status === 403 || res.status === 401) {
          setUnauthorized(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
  }, []);

  if (unauthorized) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl">
        <h2 className="text-xl font-bold mb-2">Access Denied 🛑</h2>
        <p className="text-sm text-slate-400">Only Super Admin has permission to view Audit & Security Logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit & Security Logs</h1>

      <div className="flex space-x-4 border-b">
        <button 
          className={`px-4 py-2 ${tab === 'AUDIT' ? 'border-b-2 border-primary font-bold' : ''}`}
          onClick={() => setTab('AUDIT')}
        >
          Admin Audit Logs
        </button>
        <button 
          className={`px-4 py-2 ${tab === 'SECURITY' ? 'border-b-2 border-primary font-bold' : ''}`}
          onClick={() => setTab('SECURITY')}
        >
          Security Events
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Date</th>
                {tab === 'AUDIT' ? (
                  <>
                    <th className="p-4 text-left">Admin</th>
                    <th className="p-4 text-left">Action</th>
                    <th className="p-4 text-left">Target ID</th>
                    <th className="p-4 text-left">IP Address</th>
                  </>
                ) : (
                  <>
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-left">Event</th>
                    <th className="p-4 text-left">IP Address</th>
                    <th className="p-4 text-left">Details</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {tab === 'AUDIT' && logs.map(l => {
                const adminName = l.admin?.username || 'Staff Admin';
                const cleanAction = String(l.action || '').replace(/^SUPER_ADMIN_/g, 'SYSTEM_ADMIN_');
                return (
                  <tr key={l.id} className="border-b">
                    <td className="p-4 text-sm whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-slate-200">{adminName}</td>
                    <td className="p-4 font-medium">{cleanAction}</td>
                    <td className="p-4 text-sm">{l.target || '-'}</td>
                    <td className="p-4 text-sm">{l.ip || '-'}</td>
                  </tr>
                );
              })}
              {tab === 'SECURITY' && securityEvents.map(e => {
                const userName = e.user?.username || 'User';
                return (
                  <tr key={e.id} className="border-b">
                    <td className="p-4 text-sm whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-slate-200">{userName}</td>
                    <td className="p-4 font-medium text-red-600">{e.event}</td>
                    <td className="p-4 text-sm">{e.ip || '-'}</td>
                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{e.details || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
