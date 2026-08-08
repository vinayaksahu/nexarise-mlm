'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TransactionsPage() {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'DEPOSIT', 'INVESTMENT', 'SELF_ROI', 'LEVEL_INCOME', 'REWARD', 'P2P_SENT', 'P2P_RECEIVED', 'WITHDRAWAL'];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Transactions Ledger</h1>
      
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <Button key={f} variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)} size="sm">
            {f}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Ledger Entries</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>Ref Key</th><th>Type</th><th>Amount</th><th>Balance</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>TX-1234</td>
                <td><Badge>DEPOSIT</Badge></td>
                <td className="text-green-600">+$100.00</td>
                <td>$100.00</td>
                <td>2023-10-01</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
