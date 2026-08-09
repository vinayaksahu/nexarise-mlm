'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  description: string | null;
}

export default function IncomeHistoryPage() {
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({ roiIncome: 0, levelIncome: 0, rewardIncome: 0 });
  const [entries, setEntries] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, txRes] = await Promise.all([
          fetch('/api/wallet'),
          fetch('/api/transactions?limit=100')
        ]);
        
        const walletData = await walletRes.json();
        const txData = await txRes.json();
        
        if (walletData.wallet) {
          setWallet(walletData.wallet);
        }
        
        if (txData.entries) {
          const incomeTypes = ['SELF_ROI', 'LEVEL_INCOME', 'REWARD_INCOME'];
          setEntries(txData.entries.filter((tx: Transaction) => incomeTypes.includes(tx.type)));
        }
      } catch (error) {
        console.error('Failed to fetch income data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const typeMap: Record<string, string[]> = {
    'All': ['SELF_ROI', 'LEVEL_INCOME', 'REWARD_INCOME'],
    'Self ROI': ['SELF_ROI'],
    'Level Income': ['LEVEL_INCOME'],
    'Reward Income': ['REWARD_INCOME']
  };

  const filteredEntries = entries.filter(entry => typeMap[filter]?.includes(entry.type));

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Income History</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total ROI</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold truncate">${Number(wallet.roiIncome).toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total Level Income</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold truncate">${Number(wallet.levelIncome).toFixed(2)}</CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total Reward Income</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold truncate">${Number(wallet.rewardIncome).toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>History</CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            {['All', 'Self ROI', 'Level Income', 'Reward Income'].map(f => (
              <Button key={f} variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)} className="text-xs py-1.5 px-3">
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center p-8 text-muted">No income transactions found.</div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Balance Before</th>
                    <th className="py-2.5 px-3">Balance After</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 text-xs text-muted">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3"><Badge variant="default">{entry.type}</Badge></td>
                      <td className="py-2.5 px-3 font-semibold text-green-600 dark:text-green-400">+${Number(entry.amount).toFixed(2)}</td>
                      <td className="py-2.5 px-3">${Number(entry.balanceBefore).toFixed(2)}</td>
                      <td className="py-2.5 px-3">${Number(entry.balanceAfter).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-xs text-muted">{entry.description || '-'}</td>
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
