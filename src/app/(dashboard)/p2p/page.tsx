'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function P2PPage() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');

  const numAmount = Number(amount) || 0;
  const fee = numAmount * 0.02;

  const handleTransfer = () => {
    alert(`Transferred $${amount} to ${recipient}`);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">P2P Transfer</h1>
      
      <Card>
        <CardHeader><CardTitle>Transfer Funds</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Recipient Username / Email / Referral Code" value={recipient} onChange={e => setRecipient(e.target.value)} />
          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <p>Fee: ${fee.toFixed(2)} (2%) | Net Deducted: ${(numAmount + fee).toFixed(2)}</p>
          <Input type="password" placeholder="6-digit Transaction PIN" maxLength={6} value={pin} onChange={e => setPin(e.target.value)} />
          <Button onClick={handleTransfer}>Send Funds</Button>
          <p className="text-sm"><a href="#" className="text-blue-500">Set or Update PIN</a></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>P2P History</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>Type</th><th>Party</th><th>Amount</th><th>Fee</th><th>Net Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>SENT</td><td>john_doe</td><td>$20</td><td>$0.40</td><td>$20</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
