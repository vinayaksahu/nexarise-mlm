'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function DepositsPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('USDT');

  const handleDeposit = () => {
    alert(`Deposit requested: $${amount} via ${method}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Deposits</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <Card><CardHeader className="p-3 sm:p-4"><CardTitle className="text-sm">USDT (BEP-20)</CardTitle></CardHeader><CardContent className="p-3 sm:p-4 pt-0 text-xs break-all">Address: 0x1234567890abcdef1234567890abcdef12345678</CardContent></Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Request Deposit</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input type="number" className="w-full text-sm py-2.5" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <select className="w-full p-2 border border-input bg-transparent rounded-md text-sm py-2.5" value={method} onChange={e => setMethod(e.target.value)}>
            <option>USDT (BEP-20)</option>
          </select>
          <Input className="w-full text-sm py-2.5" placeholder="Proof URL (Hash/Transaction ID)" />
          <Button onClick={handleDeposit} className="w-full sm:w-auto">Submit Request</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Deposit History</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">ID</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Method</th><th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
