'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function InvestmentsPage() {
  const [amount, setAmount] = useState('');
  const [investments, setInvestments] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    Promise.all([
      fetch('/api/investments').then(res => res.json()),
      fetch('/api/business-plan').then(res => res.json())
    ]).then(([invData, planData]) => {
      if (invData.investments) setInvestments(invData.investments);
      setConfig(planData);
      setLoading(false);
    });
  }, []);

  const handleInvest = async () => {
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) })
      });
      if (res.ok) {
        alert('Investment successful!');
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to invest');
      }
    } catch (e) {
      alert('Error processing investment');
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const activeInvestments = investments.filter(inv => inv.status === 'ACTIVE').length;
  const totalRoi = investments.reduce((sum, inv) => sum + Number(inv.roiReceived), 0);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Investments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Total Invested</CardTitle></CardHeader><CardContent>${totalInvested.toFixed(2)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Investments</CardTitle></CardHeader><CardContent>{activeInvestments}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total ROI Earned</CardTitle></CardHeader><CardContent>${totalRoi.toFixed(2)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>New Investment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input 
            type="number" 
            placeholder={`Amount ($${config?.minInvestment || 5} - $${config?.maxInvestment || 1000})`} 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
          <p>Expected ROI: {Number(amount) * (config?.totalRoiPercentage ? (config.totalRoiPercentage/100) : 2)}$ ({config?.totalRoiPercentage || 200}%)</p>
          <Button onClick={handleInvest}>Submit Investment</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Investments</CardTitle></CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <p>No investments found.</p>
          ) : (
          <table className="w-full text-left">
            <thead>
              <tr><th>ID</th><th>Amount</th><th>Status</th><th>Earned ROI</th><th>Date</th></tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id}>
                  <td>{inv.referenceKey || inv.id.substring(0,8)}</td>
                  <td>${Number(inv.amount).toFixed(2)}</td>
                  <td><Badge variant={inv.status === 'ACTIVE' ? 'success' : 'default'}>{inv.status}</Badge></td>
                  <td>${Number(inv.roiReceived).toFixed(2)}</td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
