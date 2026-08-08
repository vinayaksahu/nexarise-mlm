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
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Withdrawals</h1>
      
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4"><CardTitle>Withdrawal Information</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-sm">Available Balance: $100</p>
          <p className="text-sm">Min Withdrawal: ${config?.minWithdrawal || 5}</p>
          {config?.showWithdrawalFee && <p className="text-sm">Fee: {feePercent}%</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Request Withdrawal</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input type="number" className="w-full text-sm py-2.5" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          {config?.showWithdrawalFee && <p className="text-sm">Fee: ${fee.toFixed(2)} | Net Amount: ${netAmount.toFixed(2)}</p>}
          <select className="w-full p-2 border border-input bg-transparent rounded-md text-sm py-2.5" value={method} onChange={e => setMethod(e.target.value)}>
            <option>USDT (BEP-20)</option>
          </select>
          <Button onClick={handleWithdraw} className="w-full sm:w-auto">Submit Request</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Withdrawal History</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">ID</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Fee</th><th className="py-2.5 px-3">Net</th><th className="py-2.5 px-3">Method</th><th className="py-2.5 px-3">Status</th>
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
