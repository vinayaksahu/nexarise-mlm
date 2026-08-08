'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    
    async function loadData() {
      try {
        const [resUser, resWallet, resTeam, resTx] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/wallet'),
          fetch('/api/team'),
          fetch('/api/transactions?limit=5'),
        ]);

        if (resUser.ok) {
          const u = await resUser.json();
          setUser(u.user);
        }
        if (resWallet.ok) {
          const w = await resWallet.json();
          setWallet(w.wallet);
        }
        if (resTeam.ok) {
          const t = await resTeam.json();
          setTeam(t);
        }
        if (resTx.ok) {
          const tx = await resTx.json();
          setTransactions(tx.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const refCode = user?.referralCode || '';
  const refLink = `${origin}/register?ref=${refCode}`;

  const copyRefLink = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-muted text-sm mt-1">Here is your live account overview and growth metrics.</p>
      </div>

      {/* Referral Link Share Card */}
      <Card variant="gradient" hover={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-primary-light">
            <span>🔗 Your Exclusive Referral Link</span>
          </CardTitle>
          <CardDescription>
            Share this link to invite new members to your downline team. Anyone signing up with your link automatically joins your network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 bg-white dark:bg-slate-900 border border-border rounded-xl px-4 py-2.5 font-mono text-sm break-all flex items-center justify-between gap-2">
              <span className="truncate">{refLink}</span>
              <Badge variant="info">Code: {refCode}</Badge>
            </div>
            <Button onClick={copyRefLink} variant="primary" size="md" className="shrink-0">
              {copied ? '✓ Copied!' : '📋 Copy Referral Link'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted font-medium">Available Balance</p>
            <p className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ${wallet?.availableBalance ? Number(wallet.availableBalance).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted font-medium">Total ROI Income</p>
            <p className="text-xl lg:text-2xl font-bold text-primary dark:text-primary-light mt-1">
              ${wallet?.roiIncome ? Number(wallet.roiIncome).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted font-medium">Total Level Income</p>
            <p className="text-xl lg:text-2xl font-bold text-accent dark:text-accent-light mt-1">
              ${wallet?.levelIncome ? Number(wallet.levelIncome).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted font-medium">Total Reward Income</p>
            <p className="text-xl lg:text-2xl font-bold text-amber-500 mt-1">
              ${wallet?.rewardIncome ? Number(wallet.rewardIncome).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted font-medium">Total Earnings</p>
            <p className="text-xl lg:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              ${wallet?.totalIncome ? Number(wallet.totalIncome).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted font-medium">Total Withdrawals</p>
            <p className="text-xl lg:text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">
              ${wallet?.totalWithdrawals ? Number(wallet.totalWithdrawals).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted font-medium">Direct Referrals</p>
            <p className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {team?.directReferrals?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted font-medium">Total Business Volume</p>
            <p className="text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              ${team?.businessVolume?.totalBusiness ? Number(team.businessVolume.totalBusiness).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Banner */}
      <div className="flex flex-wrap gap-3">
        <Link href="/deposits">
          <Button variant="primary" size="md">📥 Deposit Funds</Button>
        </Link>
        <Link href="/investments">
          <Button variant="secondary" size="md">📈 Activate Investment</Button>
        </Link>
        <Link href="/p2p">
          <Button variant="outline" size="md">🔄 P2P Transfer</Button>
        </Link>
        <Link href="/withdrawals">
          <Button variant="ghost" size="md">📤 Withdraw Earnings</Button>
        </Link>
      </div>

      {/* Recent Transactions Preview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
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
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-medium">
                        <Badge variant="default">{tx.type}</Badge>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                        ${Number(tx.amount).toFixed(2)}
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
