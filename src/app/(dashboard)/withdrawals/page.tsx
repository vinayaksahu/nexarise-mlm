'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function WithdrawalsPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('USDT');

  const numAmount = Number(amount) || 0;
  const fee = numAmount * 0.05;
  const netAmount = numAmount - fee;

  const handleWithdraw = () => {
    alert(`Withdraw requested: $${amount}`);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Withdrawals</h1>
      
      <Card>
        <CardHeader><CardTitle>Withdrawal Information</CardTitle></CardHeader>
        <CardContent>
          <p>Available Balance: $100</p>
          <p>Min Withdrawal: $5</p>
          <p>Fee: 5%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Request Withdrawal</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <p>Fee: ${fee.toFixed(2)} | Net Amount: ${netAmount.toFixed(2)}</p>
          <select className="w-full p-2 border rounded" value={method} onChange={e => setMethod(e.target.value)}>
            <option>USDT</option>
            <option>Bank Transfer</option>
            <option>UPI</option>
          </select>
          <Button onClick={handleWithdraw}>Submit Request</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Withdrawal History</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>ID</th><th>Amount</th><th>Fee</th><th>Net</th><th>Method</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>WD-1</td><td>$50</td><td>$2.50</td><td>$47.50</td><td>USDT</td><td><Badge variant="default">PENDING</Badge></td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
