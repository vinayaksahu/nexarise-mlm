'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function P2PPage() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/business-plan').then(r => r.json()).then(setConfig);
  }, []);

  const numAmount = Number(amount) || 0;
  const feePercent = config?.p2pFeePercentage || 0;
  const fee = numAmount * (feePercent / 100);

  const handleTransfer = () => {
    alert(`Transferred $${amount} to ${recipient}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">P2P Transfer</h1>
      
      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Transfer Funds</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input className="w-full text-sm py-2.5" placeholder="Recipient Username / Email / Referral Code" value={recipient} onChange={e => setRecipient(e.target.value)} />
          <Input className="w-full text-sm py-2.5" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          
          {config?.showP2pFee && (
            <p className="text-sm">Fee: ${fee.toFixed(2)} ({feePercent}%) | Net Deducted: ${(numAmount + fee).toFixed(2)}</p>
          )}

          <Input className="w-full text-sm py-2.5" type="password" placeholder="6-digit Transaction PIN" maxLength={6} value={pin} onChange={e => setPin(e.target.value)} />
          <Button onClick={handleTransfer} className="w-full sm:w-auto">Send Funds</Button>
          <p className="text-sm"><a href="#" className="text-blue-500 hover:underline">Set or Update PIN</a></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>P2P History</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">Type</th><th className="py-2.5 px-3">Party</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Fee</th><th className="py-2.5 px-3">Net Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3">SENT</td><td className="py-2.5 px-3">john_doe</td><td className="py-2.5 px-3">$20</td><td className="py-2.5 px-3">$0.40</td><td className="py-2.5 px-3">$20</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
