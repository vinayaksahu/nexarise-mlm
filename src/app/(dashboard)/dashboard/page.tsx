'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  const [config, setConfig] = useState<any>(null);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [submittingInvest, setSubmittingInvest] = useState(false);
  const [investMsg, setInvestMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });

  async function loadData() {
    try {
      const [resUser, resWallet, resTeam, resTx, resInv, resPlan] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/wallet'),
        fetch('/api/team'),
        fetch('/api/transactions?limit=5'),
        fetch('/api/investments'),
        fetch('/api/business-plan'),
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
        setInvestments(inv.investments || (Array.isArray(inv) ? inv : []));
      }
      if (resPlan.ok) {
        const plan = await resPlan.json();
        setConfig(plan);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setOrigin(window.location.origin);
    loadData();
  }, []);

  const handleDashboardInvest = async () => {
    setInvestMsg({ text: '', type: '' });
    if (!investAmount || Number(investAmount) <= 0) {
      setInvestMsg({ text: 'Please enter a valid investment amount.', type: 'error' });
      return;
    }

    setSubmittingInvest(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(investAmount) })
      });
      const data = await res.json();
      if (res.ok) {
        setInvestMsg({ text: `🎉 Investment of $${Number(investAmount).toFixed(2)} successful! Account activated!`, type: 'success' });
        setInvestAmount('');
        await loadData();
        setTimeout(() => {
          setShowInvestModal(false);
          setInvestMsg({ text: '', type: '' });
        }, 1800);
      } else {
        setInvestMsg({ text: data.error || 'Investment failed', type: 'error' });
      }
    } catch (e: any) {
      setInvestMsg({ text: 'Error processing investment. Please try again.', type: 'error' });
    } finally {
      setSubmittingInvest(false);
    }
  };

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
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {(() => {
            const hasActiveInvestment = investments.some((inv: any) => inv.status === 'ACTIVE' && Number(inv.amount) > 0);
            const isAccountActive = user?.status === 'ACTIVE' && hasActiveInvestment;
            return isAccountActive ? (
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Account Status: Active</span>
            ) : (
              <>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Account Status: Inactive</span>
                <Button 
                  size="sm" 
                  variant="primary" 
                  className="text-xs py-1 px-3 shadow-md hover:scale-105 transition-transform" 
                  onClick={() => setShowInvestModal(true)}
                >
                  ⚡ Activate Account
                </Button>
              </>
            );
          })()}
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Link href="/wallet" className="sm:col-span-2 lg:col-span-2">
          <Card className="h-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center justify-between">
                <span>Total Available Balance (Main + P2P)</span>
                <span className="text-[10px] text-emerald-500">View Wallet →</span>
              </p>
              <p className="text-xl sm:text-3xl font-bold truncate mt-0.5 text-emerald-600 dark:text-emerald-400">
                ${((Number(wallet?.availableBalance || 0)) + (Number(wallet?.p2pBalance || 0))).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/wallet">
          <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Main Wallet Balance
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-emerald-600 dark:text-emerald-400">
                ${wallet?.availableBalance ? Number(wallet.availableBalance).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/p2p">
          <Card className="h-full hover:border-cyan-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                P2P Balance
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-cyan-600 dark:text-cyan-400">
                ${wallet?.p2pBalance ? Number(wallet.p2pBalance).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/self-roi">
          <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Today's ROI Income
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-emerald-500">
                ${wallet?.todaysRoi ? Number(wallet.todaysRoi).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/self-roi">
          <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total ROI Income
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-primary dark:text-primary-light">
                ${wallet?.roiIncome ? Number(wallet.roiIncome).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/level-income">
          <Card className="h-full hover:border-accent/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total Level Income
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-accent dark:text-accent-light">
                ${wallet?.levelIncome ? Number(wallet.levelIncome).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/rewards">
          <Card className="h-full hover:border-amber-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total Reward Income
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-amber-500">
                ${wallet?.rewardIncome ? Number(wallet.rewardIncome).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions">
          <Card className="h-full hover:border-indigo-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total Earnings
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-indigo-600 dark:text-indigo-400">
                ${wallet?.totalIncome ? Number(wallet.totalIncome).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/investments">
          <Card className="h-full hover:border-emerald-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total Investments
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-emerald-500">
                ${wallet?.totalInvestments ? Number(wallet.totalInvestments).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions?type=P2P_SENT">
          <Card className="h-full hover:border-red-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total P2P Sent
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-red-500">
                ${wallet?.totalP2pSent ? Number(wallet.totalP2pSent).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions?type=P2P_RECEIVED">
          <Card className="h-full hover:border-cyan-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total P2P Received
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-cyan-500">
                ${wallet?.totalP2pReceived ? Number(wallet.totalP2pReceived).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/withdrawals">
          <Card className="h-full hover:border-gray-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total Withdrawals
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-gray-700 dark:text-gray-300">
                ${wallet?.totalWithdrawals ? Number(wallet.totalWithdrawals).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="h-full hover:border-blue-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Direct Referrals
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-blue-600 dark:text-blue-400">
                {team?.directReferrals?.length || 0}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="h-full hover:border-purple-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Total Team Business
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-purple-600 dark:text-purple-400">
                ${team?.businessVolume?.totalBusiness ? Number(team.businessVolume.totalBusiness).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="h-full hover:border-purple-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Strong Leg Business
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-purple-500">
                ${team?.businessVolume?.strongLeg ? Number(team.businessVolume.strongLeg).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="h-full hover:border-amber-500/50 transition-all cursor-pointer">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
                Weak Leg Business
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate mt-0.5 text-amber-500">
                ${team?.businessVolume?.weakLeg ? Number(team.businessVolume.weakLeg).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>
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

      {/* New Investment / Activate Account Modal Popup */}
      {showInvestModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 text-left text-gray-900 dark:text-white relative z-[100000] my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📈 New Investment</span>
              </h2>
              <button 
                onClick={() => { setShowInvestModal(false); setInvestMsg({ text: '', type: '' }); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-gray-700 dark:text-slate-300">
                <span>P2P Wallet Balance:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${Number(wallet?.p2pBalance || 0).toFixed(2)}</span>
              </div>
              {Number(wallet?.p2pBalance || 0) < Number(config?.minInvestment || 5) && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  ⚠️ Low balance. You can deposit funds via <Link href="/deposits" className="underline font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Deposit section</Link>.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 font-medium mb-1.5">Investment Amount</label>
                <Input 
                  type="number" 
                  className="w-full text-base py-3 bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl"
                  placeholder={`Amount ($${config?.minInvestment || 5} - $${config?.maxInvestment || 1000})`} 
                  value={investAmount} 
                  onChange={(e: any) => setInvestAmount(e.target.value)} 
                />
              </div>

              <p className="text-sm text-slate-300">
                Expected ROI: <span className="font-bold text-emerald-400">${(Number(investAmount || 0) * (config?.totalRoiPercentage ? (config.totalRoiPercentage/100) : 2)).toFixed(2)}</span> ({config?.totalRoiPercentage || 200}%)
              </p>

              {investMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-medium ${investMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {investMsg.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleDashboardInvest} 
                  disabled={submittingInvest} 
                  variant="primary" 
                  className="w-full py-3 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
                >
                  {submittingInvest ? 'Processing Investment...' : 'Submit Investment'}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
