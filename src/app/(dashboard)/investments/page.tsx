'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function InvestmentsPage() {
  const [amount, setAmount] = useState('');
  const [investments, setInvestments] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' }>({
    show: false,
    title: '',
    message: '',
    type: 'success',
  });
  
  const loadInvestments = async () => {
    try {
      const [invRes, planRes, walletRes] = await Promise.all([
        fetch('/api/investments'),
        fetch('/api/business-plan'),
        fetch('/api/wallet')
      ]);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvestments(invData.investments || (Array.isArray(invData) ? invData : []));
      }
      if (planRes.ok) {
        const planData = await planRes.json();
        setConfig(planData);
      }
      if (walletRes.ok) {
        const wData = await walletRes.json();
        setWallet(wData.wallet);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const handleInvest = async () => {
    if (!amount || Number(amount) <= 0) {
      setPopup({
        show: true,
        title: 'Invalid Input',
        message: 'Please enter a valid investment amount.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAmount('');
        loadInvestments();
        setPopup({
          show: true,
          title: 'Investment Successful! 🎉',
          message: `Your investment of $${Number(amount).toFixed(2)} is now active and generating ROI.`,
          type: 'success',
        });
      } else {
        setPopup({
          show: true,
          title: 'Investment Failed',
          message: data.error || 'Failed to submit investment. Please try again.',
          type: 'error',
        });
      }
    } catch (e: any) {
      setPopup({
        show: true,
        title: 'Error',
        message: e.message || 'Error processing investment. Please check your connection.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const activeInvestments = investments.filter(inv => inv.status === 'ACTIVE').length;
  const totalRoi = investments.reduce((sum, inv) => sum + Number(inv.roiReceived || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>Loading investments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Investments</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold truncate">
            ${totalInvested.toFixed(2)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold truncate text-emerald-600 dark:text-emerald-400">
            {activeInvestments}
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total ROI Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold truncate text-primary dark:text-primary-light">
            ${totalRoi.toFixed(2)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>New Investment</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>P2P Wallet Balance:</span>
              <span className="font-bold text-emerald-400">${Number(wallet?.p2pBalance || 0).toFixed(2)}</span>
            </div>
            {Number(wallet?.p2pBalance || 0) < Number(config?.minInvestment || 5) && (
              <p className="text-[11px] text-amber-400 mt-1 font-medium">
                ⚠️ Low balance. You can deposit funds via <Link href="/deposits" className="underline font-semibold text-emerald-400 hover:text-emerald-300">Deposit section</Link>.
              </p>
            )}
          </div>
          <Input 
            type="number" 
            className="w-full text-sm py-2.5"
            placeholder={`Amount ($${config?.minInvestment || 5} - $${config?.maxInvestment || 1000})`} 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
          <p className="text-sm text-slate-400">
            Expected ROI: <span className="font-semibold text-emerald-500">${(Number(amount || 0) * (config?.totalRoiPercentage ? (config.totalRoiPercentage/100) : 2)).toFixed(2)}</span> ({config?.totalRoiPercentage || 200}%)
          </p>
          <Button 
            onClick={handleInvest} 
            disabled={submitting} 
            className="w-full sm:w-auto min-w-[140px]"
          >
            {submitting ? 'Processing...' : 'Submit Investment'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Your Investments</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {investments.length === 0 ? (
            <p className="text-sm text-muted py-4">No investments found.</p>
          ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Earned ROI</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-xs">{inv.referenceKey || inv.id.substring(0,8)}</td>
                    <td className="py-2.5 px-3 font-semibold">${Number(inv.amount).toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={inv.status === 'ACTIVE' ? 'success' : inv.status === 'COMPLETED' ? 'info' : inv.status === 'CANCELLED' ? 'danger' : 'default'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-emerald-500">${Number(inv.roiReceived || 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-xs text-muted">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* UI Notification Modal Popup */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in text-center">
            <div className="text-4xl">
              {popup.type === 'success' ? '✅' : '❌'}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {popup.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {popup.message}
            </p>
            <Button 
              onClick={() => setPopup(p => ({ ...p, show: false }))} 
              variant={popup.type === 'success' ? 'primary' : 'danger'}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
