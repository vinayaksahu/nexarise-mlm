'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

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

  const fmt = (val: any) => (val ? Number(val).toFixed(2) : '0.00');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Wallet Overview</h1>
        <p className="text-muted text-sm mt-1">Real-time breakdown of your balances, earnings, and quick transactions.</p>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${fmt(wallet?.availableBalance)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted font-medium">ROI Income</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xl lg:text-2xl font-bold text-primary dark:text-primary-light">
            ${fmt(wallet?.roiIncome)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted font-medium">Level Income</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xl lg:text-2xl font-bold text-accent dark:text-accent-light">
            ${fmt(wallet?.levelIncome)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted font-medium">Reward Income</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xl lg:text-2xl font-bold text-amber-500">
            ${fmt(wallet?.rewardIncome)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xl lg:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            ${fmt(wallet?.totalIncome)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-muted font-medium">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xl lg:text-2xl font-bold text-gray-700 dark:text-gray-300">
            ${fmt(wallet?.totalWithdrawals)}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex flex-wrap gap-3">
        <Link href="/deposits">
          <Button variant="primary" size="md">📥 Deposit</Button>
        </Link>
        <Link href="/withdrawals">
          <Button variant="outline" size="md">📤 Withdraw</Button>
        </Link>
        <Link href="/p2p">
          <Button variant="secondary" size="md">🔄 P2P Transfer</Button>
        </Link>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription className="text-xs mt-0.5">Your latest account transactions.</CardDescription>
          </div>
          <Link href="/transactions" className="text-xs text-primary hover:underline">View All →</Link>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p className="text-3xl mb-1">📋</p>
              <p className="text-sm">No recent transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
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
