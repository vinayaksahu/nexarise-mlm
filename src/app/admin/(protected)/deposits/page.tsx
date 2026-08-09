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
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [copiedProof, setCopiedProof] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDeposits = async () => {
    try {
      const res = await fetch(`/api/admin/deposits?status=${statusTab === 'ALL' ? '' : statusTab}`);
      if (res.ok) {
        const data = await res.json();
        setDeposits(data.deposits || (Array.isArray(data) ? data : []));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [statusTab]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    setErrorMsg(null);
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
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to update deposit status');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCopyProof = (proof: string) => {
    navigator.clipboard.writeText(proof);
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 2000);
  };

  const getBscScanUrl = (proof: string) => {
    if (proof.startsWith('http://') || proof.startsWith('https://')) {
      return proof;
    }
    const cleanHash = proof.trim();
    return `https://bscscan.com/tx/${cleanHash}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Deposit Management</h1>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex justify-between items-center">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      <div className="flex space-x-2 border-b border-border">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium transition-colors ${statusTab === tab ? 'border-b-2 border-primary text-primary font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setStatusTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-slate-400">
                <th className="p-4">ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No deposits found for this status.
                  </td>
                </tr>
              ) : (
                deposits.map(d => (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-slate-800/30">
                    <td className="p-4 font-mono text-xs">{d.id.substring(0, 8)}</td>
                    <td className="p-4">
                      <div className="font-semibold">{d.user?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400">@{d.user?.username || 'user'}</div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">${Number(d.amount).toFixed(2)}</td>
                    <td className="p-4">{d.method}</td>
                    <td className="p-4">
                      <Badge variant={d.status === 'APPROVED' ? 'success' : d.status === 'PENDING' ? 'warning' : 'danger'}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{new Date(d.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {d.proofUrl && (
                          <Button variant="outline" size="sm" onClick={() => setSelectedProof(d.proofUrl)}>
                            🔍 Proof
                          </Button>
                        )}
                        {d.status === 'PENDING' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="primary"
                              disabled={processingId === d.id}
                              onClick={() => handleAction(d.id, 'approve')}
                            >
                              {processingId === d.id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger" 
                              disabled={processingId === d.id}
                              onClick={() => setSelectedDepositId(d.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Modal */}
      {selectedDepositId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full space-y-4 bg-slate-900 border border-slate-700">
            <h3 className="text-lg font-bold text-white">Reject Deposit</h3>
            <Input 
              placeholder="Reason for rejection (optional)" 
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full text-sm"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedDepositId(null)}>Cancel</Button>
              <Button 
                variant="danger" 
                disabled={processingId === selectedDepositId}
                onClick={() => handleAction(selectedDepositId, 'reject')}
              >
                {processingId === selectedDepositId ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-lg w-full space-y-4 bg-slate-900 border border-slate-700 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🧾 Deposit Proof Details</span>
              </h3>
              <button onClick={() => setSelectedProof(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium">Transaction Hash / Proof Data:</p>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono break-all text-emerald-400">
                {selectedProof}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleCopyProof(selectedProof)}
              >
                {copiedProof ? '✓ Copied!' : '📋 Copy Hash'}
              </Button>
              <a 
                href={getBscScanUrl(selectedProof)} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="primary">
                  🔗 Open in Explorer / Link
                </Button>
              </a>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProof(null)} className="ml-auto">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
