'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function DepositsPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('USDT (BEP-20)');
  const [proofUrl, setProofUrl] = useState('');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPopup, setShowPopup] = useState(false);

  const fetchDeposits = async () => {
    try {
      const res = await fetch('/api/deposits');
      if (res.ok) {
        const data = await res.json();
        setDeposits(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch deposits:', err);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      setShowPopup(true);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          proofUrl: proofUrl || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Deposit request submitted successfully! Your request is pending admin approval.');
        setMessageType('success');
        setAmount('');
        setProofUrl('');
        fetchDeposits();
      } else {
        setMessage(data.error || 'Failed to submit deposit request');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
      setShowPopup(true);
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Deposits</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>USDT (BEP-20)</span>
              <Badge variant="info">BEP-20</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1 space-y-2">
            <p className="text-xs font-mono text-slate-300 break-all bg-slate-900/50 p-2 rounded border border-slate-700">
              0x1234567890abcdef1234567890abcdef12345678
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs" 
              onClick={() => {
                navigator.clipboard.writeText('0x1234567890abcdef1234567890abcdef12345678');
                setMessage('Deposit address copied to clipboard!');
                setMessageType('success');
                setShowPopup(true);
              }}
            >
              📋 Copy Deposit Address
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Request Deposit</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input 
            type="number" 
            className="w-full text-sm py-2.5" 
            placeholder="Amount (USDT)" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
          <select 
            className="w-full p-2 border border-input bg-transparent rounded-md text-sm py-2.5 dark:text-white dark:bg-slate-900" 
            value={method} 
            onChange={e => setMethod(e.target.value)}
          >
            <option value="USDT (BEP-20)">USDT (BEP-20)</option>
          </select>
          <Input 
            className="w-full text-sm py-2.5" 
            placeholder="Proof URL (Transaction Hash / ID)" 
            value={proofUrl}
            onChange={e => setProofUrl(e.target.value)}
          />
          <Button onClick={handleDeposit} className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Deposit History</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted">
                      <p className="text-2xl mb-1">📥</p>
                      <p className="text-sm">No deposit history yet.</p>
                    </td>
                  </tr>
                ) : (
                  deposits.map((d: any) => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono text-xs">{d.id.substring(0, 8)}</td>
                      <td className="py-2.5 px-3 font-semibold">${Number(d.amount).toFixed(2)}</td>
                      <td className="py-2.5 px-3">{d.method}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* UI Popup / Toast */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in">
            <div className="text-center">
              <p className={`text-4xl mb-2`}>
                {messageType === 'success' ? '✅' : '❌'}
              </p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {messageType === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className="text-sm text-muted mt-2">{message}</p>
            </div>
            <Button 
              onClick={() => setShowPopup(false)} 
              className="w-full"
              variant={messageType === 'success' ? 'primary' : 'danger'}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
