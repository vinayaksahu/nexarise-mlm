'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceKey: string | null;
  status: string;
  createdAt: string;
  description: string | null;
}

function TransactionsContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') || 'ALL').toUpperCase();
  const [filter, setFilter] = useState(initialType);
  const [entries, setEntries] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Deposit', value: 'DEPOSIT' },
    { label: 'Investment', value: 'INVESTMENT' },
    { label: 'Self ROI', value: 'SELF_ROI' },
    { label: 'Level Income', value: 'LEVEL_INCOME' },
    { label: 'Reward', value: 'REWARD' },
    { label: 'P2P Sent', value: 'P2P_SENT' },
    { label: 'P2P Received', value: 'P2P_RECEIVED' },
    { label: 'Withdrawal', value: 'WITHDRAWAL' },
  ];

  const creditTypes = [
    'DEPOSIT', 'DEPOSIT_TO_P2P', 'SELF_ROI', 'LEVEL_INCOME', 
    'REWARD', 'REWARD_INCOME', 'P2P_RECEIVED', 'P2P_TRANSFER_RECEIVED', 
    'REFUND', 'ADMIN_CREDIT'
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const query = filter !== 'ALL' ? `?limit=100&type=${filter}` : '?limit=100';
        const res = await fetch(`/api/transactions${query}`);
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Transactions Ledger</h1>
      
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(f => (
          <Button 
            key={f.value} 
            variant={filter === f.value ? 'primary' : 'outline'} 
            onClick={() => setFilter(f.value)} 
            size="sm"
            className="text-xs"
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Ledger Entries</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center p-8 text-muted">No transactions found for this filter.</div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Ref Key</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Bal Before</th>
                    <th className="py-2.5 px-3">Bal After</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => {
                    const isCredit = creditTypes.includes(entry.type);
                    const amountColor = isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                    const sign = isCredit ? '+' : '-';
                    
                    return (
                      <tr key={entry.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 text-xs text-muted">{new Date(entry.createdAt).toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-xs">{entry.referenceKey || '-'}</td>
                        <td className="py-2.5 px-3"><Badge variant="default">{entry.type}</Badge></td>
                        <td className={`py-2.5 px-3 font-semibold ${amountColor}`}>{sign}${Number(entry.amount).toFixed(2)}</td>
                        <td className="py-2.5 px-3">${Number(entry.balanceBefore).toFixed(2)}</td>
                        <td className="py-2.5 px-3">${Number(entry.balanceAfter).toFixed(2)}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={entry.status === 'COMPLETED' ? 'success' : entry.status === 'FAILED' ? 'danger' : 'warning'}>
                            {entry.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted max-w-xs truncate" title={entry.description || ''}>{entry.description || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading transactions...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
