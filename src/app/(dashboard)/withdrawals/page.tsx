'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmModal } from '@/components/ui/confirm-modal';

export default function WithdrawalsPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CRYPTO');
  const [walletAddress, setWalletAddress] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPopup, setShowPopup] = useState(false);

  const fetchData = async () => {
    try {
      const [resConfig, resWallet, resWd, resProfile] = await Promise.all([
        fetch('/api/business-plan'),
        fetch('/api/wallet'),
        fetch('/api/withdrawals'),
        fetch('/api/user/profile'),
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
      if (resProfile.ok) {
        const pData = await resProfile.json();
        const u = pData.profile;
        if (u) {
          setUserProfile(u);
          const defaultType = u.defaultPayoutMethod || 'CRYPTO';
          let defaultStr = '';
          if (defaultType === 'BANKING' && u.bankAccountNumber) {
            defaultStr = `[BANKING] ${u.bankName || 'Bank'} - Acc: ${u.bankAccountNumber} (IFSC: ${u.bankIfscCode || 'N/A'})`;
            setMethod('BANKING');
          } else if (defaultType === 'UPI' && u.upiId) {
            defaultStr = `[UPI] ${u.upiId}`;
            setMethod('UPI');
          } else {
            defaultStr = u.cryptoWalletAddress || u.walletAddress || '';
            setMethod(`CRYPTO (${u.cryptoNetwork || 'USDT BEP-20'})`);
          }
          setWalletAddress(defaultStr);
        }
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
      setMessage('Please configure or enter your receiving payment account details');
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
        setMessage('🎉 Withdrawal request submitted successfully! Your request is pending admin approval.');
        setMessageType('success');
        setAmount('');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawals</h1>
          <p className="text-xs text-muted mt-1">Request funds payout to your default receiving method</p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            💳 Manage Payout Methods
          </Button>
        </Link>
      </div>
      
      <Card className="p-4 sm:p-6 space-y-3">
        <CardHeader className="p-0 border-b border-gray-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg font-bold">Withdrawal Rules & Balance</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2 space-y-1.5 text-sm">
          <p className="text-sm">Available Main Wallet Balance: <span className="font-bold text-emerald-600 dark:text-emerald-400">${wallet?.availableBalance ? Number(wallet.availableBalance).toFixed(2) : '0.00'}</span></p>
          <p className="text-xs text-muted">Note: Withdrawals are funded strictly from Main Wallet balance.</p>
          <p className="text-sm">Min Withdrawal: <span className="font-medium">${config?.minWithdrawal || 5}</span></p>
          {config?.showWithdrawalFee && <p className="text-sm">Fee: <span className="font-medium">{feePercent}%</span></p>}
          {userProfile?.defaultPayoutMethod && (
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1">
              ⚡ Default Active Payout Method: <span className="uppercase font-bold">{userProfile.defaultPayoutMethod}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <CardHeader className="p-0 border-b border-gray-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg font-bold">Request New Withdrawal</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Withdrawal Amount (USDT)</label>
            <Input 
              type="number" 
              className="w-full text-sm py-2.5" 
              placeholder="Enter amount" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Receiving Method / Account Details</label>
            <Input 
              type="text" 
              className="w-full text-sm py-2.5 font-mono" 
              placeholder="Payout receiving details (Crypto, Bank, or UPI)" 
              value={walletAddress} 
              onChange={e => setWalletAddress(e.target.value)} 
            />
            <p className="text-[11px] text-muted mt-1">
              Pre-filled from your profile's active default method. You can manage receiving methods in <Link href="/settings" className="text-blue-600 underline">Account Settings</Link>.
            </p>
          </div>

          {config?.showWithdrawalFee && (
            <p className="text-sm text-muted">Fee: ${fee.toFixed(2)} | Net Amount to Receive: <span className="font-semibold text-gray-900 dark:text-white">${netAmount.toFixed(2)}</span></p>
          )}

          <Button 
            className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5" 
            onClick={handleWithdraw} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Withdrawal Request'}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <CardHeader className="p-0 border-b border-gray-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg font-bold">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="p-3 font-semibold">Date & Time</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold">Fee</th>
                  <th className="p-3 font-semibold">Net Received</th>
                  <th className="p-3 font-semibold">Method / Address</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted">No withdrawal history found</td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-muted/10">
                      <td className="p-3 text-xs text-muted">{new Date(w.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-bold">${Number(w.amount).toFixed(2)}</td>
                      <td className="p-3 text-xs text-muted">${Number(w.fee).toFixed(2)}</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">${Number(w.netAmount).toFixed(2)}</td>
                      <td className="p-3 text-xs font-mono break-all max-w-[200px]">{w.method}</td>
                      <td className="p-3">
                        <Badge variant={statusVariant(w.status)} className="text-[10px]">
                          {w.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showPopup}
        onConfirm={() => setShowPopup(false)}
        onCancel={() => setShowPopup(false)}
        title={messageType === 'success' ? 'Success' : 'Notice'}
        message={message}
        confirmText="OK"
        cancelText=""
        variant={messageType === 'success' ? 'success' : 'danger'}
      />
    </div>
  );
}
