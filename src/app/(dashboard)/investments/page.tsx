'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InvestmentsPage() {
  const [amount, setAmount] = useState('');
  
  const handleInvest = async () => {
    alert(`Invested $${amount}`);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Investments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Total Invested</CardTitle></CardHeader><CardContent>$500</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Investments</CardTitle></CardHeader><CardContent>1</CardContent></Card>
        <Card><CardHeader><CardTitle>Total ROI Earned</CardTitle></CardHeader><CardContent>$50</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>New Investment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input 
            type="number" 
            placeholder="Amount ($5 - $1000)" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
          <p>Expected ROI: {Number(amount) * 2}$ (200%)</p>
          <Button onClick={handleInvest}>Submit Investment</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Investments</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>ID</th><th>Amount</th><th>Status</th><th>Daily ROI</th><th>Earned ROI</th></tr>
            </thead>
            <tbody>
              <tr><td>INV-1</td><td>$500</td><td>ACTIVE</td><td>$5</td><td>$50</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
