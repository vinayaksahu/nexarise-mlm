'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SelfROIPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [roiTxs, setRoiTxs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [resWallet, resInv, resTx, resConfig] = await Promise.all([
          fetch('/api/wallet'),
          fetch('/api/investments'),
          fetch('/api/transactions?limit=20'),
          fetch('/api/business-plan'),
        ]);

        if (resWallet.ok) {
          const w = await resWallet.json();
          setWallet(w.wallet);
        }
        if (resInv.ok) {
          const inv = await resInv.json();
          setInvestments(inv.investments || []);
        }
        if (resTx.ok) {
          const tx = await resTx.json();
          const filtered = (tx.entries || []).filter((t: any) => t.type === 'SELF_ROI');
          setRoiTxs(filtered);
        }
        if (resConfig.ok) {
          const cfg = await resConfig.json();
          setConfig(cfg);
        }
      } catch (err) {
        console.error('Failed to load ROI data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>Loading Self ROI data...</span>
      </div>
    );
  }

  const fmt = (val: any) => (val ? Number(val).toFixed(2) : '0.00');
  const activeInvestments = investments.filter((i: any) => i.status === 'ACTIVE');
  const totalActiveCapital = activeInvestments.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Self ROI History</h1>
        <p className="text-muted text-sm mt-1">Track your active investment returns, daily ROI rate, and payout history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total Self ROI Earned</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-primary dark:text-primary-light truncate">${fmt(wallet?.roiIncome)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Daily ROI Rate</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">{config?.dailyRoiPercentage ?? 1}% / day</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Active Capital</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 truncate">${fmt(totalActiveCapital)}</CardContent>
        </Card>
      </div>

      {/* Active Investments Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Active Investment Progress</CardTitle>
          <CardDescription>200-day ROI duration breakdown per active investment plan.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeInvestments.length === 0 ? (
            <div className="text-center py-6 text-muted">
              <p className="text-sm">No active investments found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInvestments.map((inv: any) => {
                const startDate = new Date(inv.startDate);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - startDate.getTime());
                const daysPassed = Math.min(200, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                const pct = Math.min(100, Math.round((daysPassed / 200) * 100));

                return (
                  <div key={inv.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-border">
                    <div className="flex justify-between items-center text-sm mb-1.5 font-medium">
                      <span>Investment ID: <span className="font-mono text-xs text-primary">{inv.id.substring(0, 8)}...</span></span>
                      <span>Amount: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${fmt(inv.amount)}</span> ({daysPassed} / 200 Days)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent ROI Distributions Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Recent ROI Distributions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {roiTxs.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p className="text-3xl mb-1">📈</p>
              <p className="text-sm">No ROI payouts recorded yet.</p>
              <p className="text-xs text-muted mt-1">Daily ROI is distributed automatically every 24 hours.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Reference Key</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roiTxs.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 text-xs text-muted">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">${fmt(tx.amount)}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-muted">{tx.referenceKey}</td>
                      <td className="py-2.5 px-3"><Badge variant="success">COMPLETED</Badge></td>
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
