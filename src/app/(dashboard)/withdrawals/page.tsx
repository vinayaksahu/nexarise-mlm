'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function WithdrawalsPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('USDT (BEP-20)');
  const [walletAddress, setWalletAddress] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPopup, setShowPopup] = useState(false);

  const fetchData = async () => {
    try {
      const [resConfig, resWallet, resWd] = await Promise.all([
        fetch('/api/business-plan'),
        fetch('/api/wallet'),
        fetch('/api/withdrawals'),
      ]);
      if (resConfig.ok) setConfig(await resConfig.json());
      if (resWallet.ok) {
        const w = await resWallet.json();
        setWallet(w.wallet || w);
      }
      if (resWd.ok) {
        const data = await resWd.json();
        setWithdrawals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const numAmount = Number(amount) || 0;
  const feePercent = config?.withdrawalFeePercentage || 0;
  const fee = numAmount * (feePercent / 100);
  const netAmount = numAmount - fee;

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      setShowPopup(true);
      return;
    }

    if (!walletAddress.trim()) {
      setMessage('Please enter your receiving wallet address');
      setMessageType('error');
      setShowPopup(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Number(amount), 
          method,
          walletAddress: walletAddress.trim()
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Withdrawal request submitted successfully! Your request is pending admin approval.');
        setMessageType('success');
        setAmount('');
        setWalletAddress('');
        fetchData();
      } else {
        setMessage(data.error || 'Failed to submit withdrawal request');
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
      case 'APPROVED': case 'PAID': return 'success';
      case 'PENDING': case 'PROCESSING': return 'warning';
      case 'REJECTED': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Withdrawals</h1>
      
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4"><CardTitle>Withdrawal Information</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-1">
          <p className="text-sm">Available Main Wallet Balance: <span className="font-bold text-emerald-600 dark:text-emerald-400">${wallet?.availableBalance ? Number(wallet.availableBalance).toFixed(2) : '0.00'}</span></p>
          <p className="text-sm text-slate-400 text-xs">Note: Withdrawals are funded strictly from Main Wallet balance.</p>
          <p className="text-sm">Min Withdrawal: <span className="font-medium">${config?.minWithdrawal || 5}</span></p>
          {config?.showWithdrawalFee && <p className="text-sm">Fee: <span className="font-medium">{feePercent}%</span></p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Request Withdrawal</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input 
            type="number" 
            className="w-full text-sm py-2.5" 
            placeholder="Amount (USDT)" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
          <Input 
            type="text" 
            className="w-full text-sm py-2.5 font-mono" 
            placeholder="USDT (BEP-20) Receiving Wallet Address (0x...)" 
            value={walletAddress} 
            onChange={e => setWalletAddress(e.target.value)} 
          />
          {config?.showWithdrawalFee && (
            <p className="text-sm text-muted">Fee: ${fee.toFixed(2)} | Net Amount: <span className="font-semibold text-gray-900 dark:text-white">${netAmount.toFixed(2)}</span></p>
          )}
          <select className="w-full p-2 border border-input bg-transparent rounded-md text-sm py-2.5 dark:text-white dark:bg-slate-900" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="USDT (BEP-20)">USDT (BEP-20)</option>
          </select>
          <Button onClick={handleWithdraw} className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Withdrawal History</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Fee</th>
                  <th className="py-2.5 px-3">Net</th>
                  <th className="py-2.5 px-3">Destination / Method</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted">
                      <p className="text-2xl mb-1">📤</p>
                      <p className="text-sm">No withdrawal history yet.</p>
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w: any) => (
                    <tr key={w.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono text-xs">{w.id.substring(0, 8)}</td>
                      <td className="py-2.5 px-3 font-semibold">${Number(w.amount).toFixed(2)}</td>
                      <td className="py-2.5 px-3">${Number(w.fee).toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-500">${Number(w.netAmount).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-xs font-mono break-all max-w-[200px]">{w.method || 'USDT (BEP-20)'}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={statusVariant(w.status)}>{w.status}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted">
                        {new Date(w.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* UI Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in">
            <div className="text-center">
              <p className="text-4xl mb-2">
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
