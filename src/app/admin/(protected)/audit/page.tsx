'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [tab, setTab] = useState<'AUDIT' | 'SECURITY'>('AUDIT');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/audit');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.auditLogs || []);
          setSecurityEvents(data.securityEvents || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
  }, []);

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
              {tab === 'AUDIT' && logs.map(l => (
                <tr key={l.id} className="border-b">
                  <td className="p-4 text-sm whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-4">{l.admin?.username || '-'}</td>
                  <td className="p-4 font-medium">{l.action}</td>
                  <td className="p-4 text-sm">{l.target || '-'}</td>
                  <td className="p-4 text-sm">{l.ip || '-'}</td>
                </tr>
              ))}
              {tab === 'SECURITY' && securityEvents.map(e => (
                <tr key={e.id} className="border-b">
                  <td className="p-4 text-sm whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="p-4">{e.user?.username || '-'}</td>
                  <td className="p-4 font-medium text-red-600">{e.event}</td>
                  <td className="p-4 text-sm">{e.ip || '-'}</td>
                  <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{e.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
