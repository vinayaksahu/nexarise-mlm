'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transferAmount, setTransferAmount] = useState('');
  const [pin, setPin] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadWalletData() {
      try {
        const [resWallet, resTx] = await Promise.all([
          fetch('/api/wallet'),
          fetch('/api/transactions?limit=5'),
        ]);

        if (resWallet.ok) {
          const w = await resWallet.json();
          setWallet(w.wallet);
        }
        if (resTx.ok) {
          const tx = await resTx.json();
          setTransactions(tx.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load wallet data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWalletData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>Loading wallet...</span>
      </div>
    );
  }

  const handleTransfer = async () => {
    setMessage('');
    setIsTransferring(true);
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(transferAmount), pin }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Transfer successful!');
        setTransferAmount('');
        setPin('');
        const resWallet = await fetch('/api/wallet');
        if (resWallet.ok) {
          const w = await resWallet.json();
          setWallet(w.wallet);
        }
      } else {
        setMessage(data.error || 'Transfer failed');
      }
    } catch (err) {
      setMessage('Error processing transfer');
    } finally {
      setIsTransferring(false);
    }
  };

  const fmt = (val: any) => (val ? Number(val).toFixed(2) : '0.00');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Wallet Overview</h1>
        <p className="text-muted text-sm mt-1">Real-time breakdown of your balances, earnings, and quick transactions.</p>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
            ${fmt(wallet?.availableBalance)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              P2P Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400 truncate">
            ${fmt(wallet?.p2pBalance)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              ROI Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold text-primary dark:text-primary-light truncate">
            ${fmt(wallet?.roiIncome)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Level Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold text-accent dark:text-accent-light truncate">
            ${fmt(wallet?.levelIncome)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Reward Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold text-amber-500 truncate">
            ${fmt(wallet?.rewardIncome)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
            ${fmt(wallet?.totalIncome)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold text-gray-700 dark:text-gray-300 truncate">
            ${fmt(wallet?.totalWithdrawals)}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <Link href="/deposits">
          <Button variant="primary" className="w-full sm:w-auto text-xs py-2.5 justify-center">📥 Deposit</Button>
        </Link>
        <Link href="/withdrawals">
          <Button variant="outline" className="w-full sm:w-auto text-xs py-2.5 justify-center">📤 Withdraw</Button>
        </Link>
        <Link href="/p2p">
          <Button variant="secondary" className="w-full sm:w-auto text-xs py-2.5 justify-center">🔄 P2P Transfer</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Transfer to P2P Wallet</CardTitle>
          <CardDescription className="text-xs">Move funds from Available Balance to P2P Balance for peer-to-peer transfers.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input 
            className="w-full text-sm py-2.5" 
            type="number" 
            placeholder="Amount to transfer" 
            value={transferAmount} 
            onChange={e => setTransferAmount(e.target.value)} 
          />
          <Input 
            className="w-full text-sm py-2.5" 
            type="password" 
            placeholder="6-digit Transaction PIN" 
            maxLength={6} 
            value={pin} 
            onChange={e => setPin(e.target.value)} 
          />
          {message && <p className={`text-sm ${message.includes('Error') || message.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
          <Button onClick={handleTransfer} className="w-full sm:w-auto" disabled={isTransferring}>
            {isTransferring ? 'Transferring...' : 'Transfer to P2P'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <div>
            <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
            <CardDescription className="text-xs mt-0.5">Your latest account transactions.</CardDescription>
          </div>
          <Link href="/transactions" className="text-xs text-primary hover:underline">View All →</Link>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p className="text-3xl mb-1">📋</p>
              <p className="text-sm">No recent transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Balance After</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-medium">
                        <Badge variant="default">{tx.type}</Badge>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                        ${fmt(tx.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-muted">
                        ${fmt(tx.balanceAfter)}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'danger'}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
