'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TransactionsPage() {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'DEPOSIT', 'INVESTMENT', 'SELF_ROI', 'LEVEL_INCOME', 'REWARD', 'P2P_SENT', 'P2P_RECEIVED', 'WITHDRAWAL'];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Transactions Ledger</h1>
      
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <Button key={f} variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)} size="sm">
            {f}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Ledger Entries</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">Ref Key</th><th className="py-2.5 px-3">Type</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Balance</th><th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-mono text-xs">TX-1234</td>
                  <td className="py-2.5 px-3"><Badge>DEPOSIT</Badge></td>
                  <td className="py-2.5 px-3 font-semibold text-green-600 dark:text-green-400">+$100.00</td>
                  <td className="py-2.5 px-3">$100.00</td>
                  <td className="py-2.5 px-3 text-xs text-muted">2023-10-01</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
