'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LevelIncomePage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [levelTxs, setLevelTxs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/level-income');
        if (res.ok) {
          const data = await res.json();
          setWallet(data.wallet);
          setConfig(data.config);
          setLevelTxs(data.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load level income data:', err);
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
        <span>Loading Level Income data...</span>
      </div>
    );
  }

  const fmt = (val: any) => (val ? Number(val).toFixed(2) : '0.00');
  const levelPcts = config?.levelIncomePercentages || [30, 20, 10, 5, 5, 5, 5, 2.5, 2.5, 2.5, 2.5];
  const maxLevels = config?.maxLevels || 11;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Level Income</h1>
        <p className="text-muted text-sm mt-1">Multi-level referral commission earnings across {maxLevels} network levels.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total Level Income Earned</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-accent dark:text-accent-light truncate">${fmt(wallet?.levelIncome)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Max Network Levels</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-primary dark:text-primary-light truncate">{maxLevels} Levels</CardContent>
        </Card>
      </div>

      {/* Level Percentages Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{maxLevels}-Level Commission Plan</CardTitle>
          <CardDescription>Percentage share earned from your downline daily ROI distributions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {levelPcts.map((pct: number, i: number) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-slate-900 border border-border rounded-xl text-center">
                <p className="text-xs text-muted font-medium">Level {i + 1}</p>
                <p className="text-lg font-bold text-primary dark:text-primary-light mt-0.5">{pct}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Income Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Level Income Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {levelTxs.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p className="text-3xl mb-1">🏆</p>
              <p className="text-sm font-medium">No level income transactions yet.</p>
              <p className="text-xs text-muted mt-1">Level income is credited automatically when members in your downline network earn daily ROI.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2.5 px-3">Level</th>
                    <th className="py-2.5 px-3">Downline User</th>
                    <th className="py-2.5 px-3">Base ROI</th>
                    <th className="py-2.5 px-3">Commission %</th>
                    <th className="py-2.5 px-3">Income Amount</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Ref Key</th>
                  </tr>
                </thead>
                <tbody>
                  {levelTxs.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3"><Badge variant="info">Level {tx.level}</Badge></td>
                      <td className="py-2.5 px-3 font-medium">
                        {tx.sourceUser ? `${tx.sourceUser.name} (@${tx.sourceUser.username})` : 'Downline Member'}
                      </td>
                      <td className="py-2.5 px-3 text-muted">${fmt(tx.baseRoiAmount)}</td>
                      <td className="py-2.5 px-3 font-semibold text-primary">{tx.percentage}%</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">+${fmt(tx.amount)}</td>
                      <td className="py-2.5 px-3 text-xs text-muted">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-muted">{tx.referenceKey || '-'}</td>
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
