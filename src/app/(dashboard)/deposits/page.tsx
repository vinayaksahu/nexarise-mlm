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
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Deposits</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>USDT (TRC-20)</CardTitle></CardHeader><CardContent>Address: T...</CardContent></Card>
        <Card><CardHeader><CardTitle>Bank Transfer</CardTitle></CardHeader><CardContent>Account: 123...</CardContent></Card>
        <Card><CardHeader><CardTitle>UPI</CardTitle></CardHeader><CardContent>UPI ID: nexa@upi</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Request Deposit</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <select className="w-full p-2 border rounded" value={method} onChange={e => setMethod(e.target.value)}>
            <option>USDT</option>
            <option>Bank Transfer</option>
            <option>UPI</option>
          </select>
          <Input placeholder="Proof URL (Hash/Transaction ID)" />
          <Button onClick={handleDeposit}>Submit Request</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Deposit History</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>ID</th><th>Amount</th><th>Method</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>DEP-1</td><td>$100</td><td>USDT</td><td><Badge variant="default">PENDING</Badge></td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
