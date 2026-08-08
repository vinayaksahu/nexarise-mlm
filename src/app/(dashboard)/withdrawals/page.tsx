'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function WithdrawalsPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('USDT');
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/business-plan').then(r => r.json()).then(setConfig);
  }, []);

  const numAmount = Number(amount) || 0;
  const feePercent = config?.withdrawalFeePercentage || 0;
  const fee = numAmount * (feePercent / 100);
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
          <p>Min Withdrawal: ${config?.minWithdrawal || 5}</p>
          {config?.showWithdrawalFee && <p>Fee: {feePercent}%</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Request Withdrawal</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          {config?.showWithdrawalFee && <p>Fee: ${fee.toFixed(2)} | Net Amount: ${netAmount.toFixed(2)}</p>}
          <select className="w-full p-2 border rounded" value={method} onChange={e => setMethod(e.target.value)}>
            <option>USDT (BEP-20)</option>
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
              
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
