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
  const [investments, setInvestments] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    
    async function loadData() {
      try {
        const [resUser, resWallet, resTeam, resTx, resInv] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/wallet'),
          fetch('/api/team'),
          fetch('/api/transactions?limit=5'),
          fetch('/api/investments'),
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
          setTransactions(tx.entries || []);
        }
        if (resInv.ok) {
          const inv = await resInv.json();
          setInvestments(inv.investments || []);
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
        {user?.status === 'ACTIVE' ? (
          <span className="inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Account Status: Active</span>
        ) : (
          <span className="inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Account Status: Inactive</span>
        )}
        <p className="text-muted text-sm mt-1">Here is your live account overview and growth metrics.</p>
      </div>

      {/* Referral Link Share Card */}
      <Card variant="gradient" hover={false}>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-primary dark:text-primary-light text-base sm:text-lg">
            <span>🔗 Your Exclusive Referral Link</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Share this link to invite new members to your downline team. Anyone signing up with your link automatically joins your network.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="w-full text-xs font-mono truncate px-3 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg flex items-center justify-between gap-2">
              <span className="truncate">{refLink}</span>
              <Badge variant="info" className="shrink-0">Code: {refCode}</Badge>
            </div>
            <Button onClick={copyRefLink} variant="primary" className="w-full sm:w-auto text-xs py-2 shrink-0">
              {copied ? '✓ Copied!' : '📋 Copy Referral Link'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Card className="sm:col-span-2 lg:col-span-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Available Balance (Main + P2P)
            </p>
            <p className="text-xl sm:text-3xl font-bold truncate mt-0.5 text-emerald-600 dark:text-emerald-400">
              ${((Number(wallet?.availableBalance || 0)) + (Number(wallet?.p2pBalance || 0))).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Main Wallet Balance
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-emerald-600 dark:text-emerald-400">
              ${wallet?.availableBalance ? Number(wallet.availableBalance).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              P2P Balance
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-cyan-600 dark:text-cyan-400">
              ${wallet?.p2pBalance ? Number(wallet.p2pBalance).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total ROI Income
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-primary dark:text-primary-light">
              ${wallet?.roiIncome ? Number(wallet.roiIncome).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Level Income
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-accent dark:text-accent-light">
              ${wallet?.levelIncome ? Number(wallet.levelIncome).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Reward Income
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-amber-500">
              ${wallet?.rewardIncome ? Number(wallet.rewardIncome).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Earnings
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-indigo-600 dark:text-indigo-400">
              ${wallet?.totalIncome ? Number(wallet.totalIncome).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Withdrawals
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-gray-700 dark:text-gray-300">
              ${wallet?.totalWithdrawals ? Number(wallet.totalWithdrawals).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Direct Referrals
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-blue-600 dark:text-blue-400">
              {team?.directReferrals?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Business Volume
            </p>
            <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-purple-600 dark:text-purple-400">
              ${team?.businessVolume?.totalBusiness ? Number(team.businessVolume.totalBusiness).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Banner */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <Link href="/deposits">
          <Button variant="primary" className="w-full sm:w-auto text-xs py-2.5 justify-center">📥 Deposit Funds</Button>
        </Link>
        <Link href="/investments">
          <Button variant="secondary" className="w-full sm:w-auto text-xs py-2.5 justify-center">📈 Activate Investment</Button>
        </Link>
        <Link href="/p2p">
          <Button variant="outline" className="w-full sm:w-auto text-xs py-2.5 justify-center">🔄 P2P Transfer</Button>
        </Link>
        <Link href="/withdrawals">
          <Button variant="ghost" className="w-full sm:w-auto text-xs py-2.5 justify-center">📤 Withdraw Earnings</Button>
        </Link>
      </div>

      {/* Recent Transactions Preview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
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
