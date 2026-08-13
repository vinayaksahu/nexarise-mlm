'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  FileText,
  Link as LinkIcon,
  Copy,
  Check,
  Zap
} from 'lucide-react';

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

  const { t } = useLanguage();

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
    <div className="space-y-4 animate-fade-in">
      {/* Sleek Compact Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t('welcomeBack')}, {user?.name || 'User'}!
            </h1>
            {user?.status === 'ACTIVE' ? (
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20">
                {t('active')}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-500/20">
                {t('inactive')}
              </span>
            )}
          </div>
          <p className="text-muted text-xs mt-0.5">{t('liveAccountOverview')}</p>
        </div>

        {user?.status !== 'ACTIVE' && (
          <Button 
            size="sm" 
            variant="primary" 
            className="text-xs py-1.5 px-3 shadow-md shrink-0 self-start sm:self-auto flex items-center gap-1 font-bold" 
            onClick={() => setShowInvestModal(true)}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{t('activateAccount')}</span>
          </Button>
        )}
      </div>

      {/* Compact Referral Link Bar */}
      <Card className="p-3 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <LinkIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{t('refLinkTitle')}</p>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">{t('refLinkSub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-none md:w-auto">
            <div className="w-full md:w-80 text-xs font-mono truncate px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-2">
              <span className="truncate text-blue-600 dark:text-blue-400">{refLink}</span>
              <Badge variant="info" className="shrink-0 text-[10px] py-0 px-1.5">Code: {refCode}</Badge>
            </div>
            <Button onClick={copyRefLink} variant="primary" className="text-xs py-1.5 px-3 shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('copy')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Financial Stat Cards Grid - Centered & Bold Text with i18n Translation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <Link href="/wallet" className="sm:col-span-2 lg:col-span-2">
          <Card className="h-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-200 leading-tight text-center">
                {t('totalAvailableBalance')}
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold truncate mt-1 text-emerald-600 dark:text-emerald-400">
                ${((Number(wallet?.availableBalance || 0)) + (Number(wallet?.p2pBalance || 0))).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/wallet">
          <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('mainWalletBalance')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-emerald-600 dark:text-emerald-400">
                ${wallet?.availableBalance ? Number(wallet.availableBalance).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/p2p">
          <Card className="h-full hover:border-cyan-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('p2pBalance')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-cyan-600 dark:text-cyan-400">
                ${wallet?.p2pBalance ? Number(wallet.p2pBalance).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/self-roi">
          <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('todaysRoi')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-emerald-500">
                ${wallet?.todaysRoi ? Number(wallet.todaysRoi).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/self-roi">
          <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalRoi')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-primary dark:text-primary-light">
                ${wallet?.roiIncome ? Number(wallet.roiIncome).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/level-income">
          <Card className="h-full hover:border-accent/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalLevelIncome')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-indigo-600 dark:text-indigo-400">
                ${wallet?.levelIncome ? Number(wallet.levelIncome).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/rewards">
          <Card className="h-full hover:border-amber-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalRewardIncome')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-amber-500">
                ${wallet?.rewardIncome ? Number(wallet.rewardIncome).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions">
          <Card className="h-full hover:border-indigo-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalEarnings')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-blue-600 dark:text-blue-400">
                ${wallet?.totalIncome ? Number(wallet.totalIncome).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/investments">
          <Card className="h-full hover:border-emerald-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalInvestments')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-emerald-500">
                ${wallet?.totalInvestments ? Number(wallet.totalInvestments).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions?type=P2P_SENT">
          <Card className="h-full hover:border-red-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalP2pSent')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-red-500">
                ${wallet?.totalP2pSent ? Number(wallet.totalP2pSent).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions?type=P2P_RECEIVED">
          <Card className="h-full hover:border-cyan-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalP2pReceived')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-cyan-500">
                ${wallet?.totalP2pReceived ? Number(wallet.totalP2pReceived).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/withdrawals">
          <Card className="h-full hover:border-gray-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalWithdrawals')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-gray-700 dark:text-gray-300">
                ${wallet?.totalWithdrawals ? Number(wallet.totalWithdrawals).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="h-full hover:border-blue-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('directReferrals')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-blue-600 dark:text-blue-400">
                {team?.directReferrals?.length || 0}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="h-full hover:border-purple-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('totalTeamBusiness')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-purple-600 dark:text-purple-400">
                ${team?.businessVolume?.totalBusiness ? Number(team.businessVolume.totalBusiness).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="h-full hover:border-purple-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('strongLegBusiness')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-purple-500">
                ${team?.businessVolume?.strongLeg ? Number(team.businessVolume.strongLeg).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="h-full hover:border-amber-500/50 transition-all cursor-pointer">
            <CardContent className="p-3.5 text-center flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 leading-tight">
                {t('weakLegBusiness')}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold truncate mt-1 text-amber-500">
                ${team?.businessVolume?.weakLeg ? Number(team.businessVolume.weakLeg).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Action Banner */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <Link href="/deposits">
          <Button variant="primary" className="w-full sm:w-auto text-xs py-2 justify-center flex items-center gap-1 font-bold">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{t('depositFunds')}</span>
          </Button>
        </Link>
        <Link href="/investments">
          <Button variant="secondary" className="w-full sm:w-auto text-xs py-2 justify-center flex items-center gap-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('activateInvestment')}</span>
          </Button>
        </Link>
        <Link href="/p2p">
          <Button variant="outline" className="w-full sm:w-auto text-xs py-2 justify-center flex items-center gap-1 font-bold">
            <Repeat className="w-3.5 h-3.5" />
            <span>{t('p2pTransfer')}</span>
          </Button>
        </Link>
        <Link href="/withdrawals">
          <Button variant="ghost" className="w-full sm:w-auto text-xs py-2 justify-center flex items-center gap-1 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{t('withdrawEarnings')}</span>
          </Button>
        </Link>
      </div>

      {/* Recent Transactions Preview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-5">
          <CardTitle className="text-base sm:text-lg font-bold">{t('recentTransactions')}</CardTitle>
          <Link href="/transactions" className="text-xs text-primary font-bold hover:underline">{t('viewAll')}</Link>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-5 pt-0">
          {transactions.length === 0 ? (
            <div className="text-center py-6 text-muted font-medium">
              <p className="text-xs">No recent transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-gray-500 dark:text-slate-400 font-bold">
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-semibold">
                        <Badge variant="default" className="text-[10px] py-0 px-1.5">{tx.type}</Badge>
                      </td>
                      <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">
                        ${Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'danger'} className="text-[10px] py-0 px-1.5 font-bold">
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-gray-500 dark:text-slate-400 font-medium">
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
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>New Investment</span>
              </h2>
              <button 
                onClick={() => { setShowInvestModal(false); setInvestMsg({ text: '', type: '' }); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-gray-700 dark:text-slate-300 font-semibold">
                <span>P2P Wallet Balance:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${Number(wallet?.p2pBalance || 0).toFixed(2)}</span>
              </div>
              {Number(wallet?.p2pBalance || 0) < Number(config?.minInvestment || 5) && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  Low balance. You can deposit funds via <Link href="/deposits" className="underline font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Deposit section</Link>.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-slate-300 font-bold mb-1.5">Investment Amount</label>
                <Input 
                  type="number" 
                  className="w-full text-base py-3 bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl font-bold"
                  placeholder={`Amount ($${config?.minInvestment || 5} - $${config?.maxInvestment || 1000})`} 
                  value={investAmount} 
                  onChange={(e: any) => setInvestAmount(e.target.value)} 
                />
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">
                Expected ROI: <span className="font-bold text-emerald-500">${(Number(investAmount || 0) * (config?.totalRoiPercentage ? (config.totalRoiPercentage/100) : 2)).toFixed(2)}</span> ({config?.totalRoiPercentage || 200}%)
              </p>

              {investMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-bold ${investMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {investMsg.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleDashboardInvest} 
                  disabled={submittingInvest} 
                  variant="primary" 
                  className="w-full py-3 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
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
