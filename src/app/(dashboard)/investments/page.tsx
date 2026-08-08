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
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Investments</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card><CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted font-medium truncate">Total Invested</CardTitle></CardHeader><CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold truncate">${totalInvested.toFixed(2)}</CardContent></Card>
        <Card><CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted font-medium truncate">Active Investments</CardTitle></CardHeader><CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold truncate">{activeInvestments}</CardContent></Card>
        <Card><CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted font-medium truncate">Total ROI Earned</CardTitle></CardHeader><CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 text-lg sm:text-2xl font-bold truncate">${totalRoi.toFixed(2)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>New Investment</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input 
            type="number" 
            className="w-full text-sm py-2.5"
            placeholder={`Amount ($${config?.minInvestment || 5} - $${config?.maxInvestment || 1000})`} 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
          <p className="text-sm">Expected ROI: {Number(amount) * (config?.totalRoiPercentage ? (config.totalRoiPercentage/100) : 2)}$ ({config?.totalRoiPercentage || 200}%)</p>
          <Button onClick={handleInvest} className="w-full sm:w-auto">Submit Investment</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Your Investments</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {investments.length === 0 ? (
            <p>No investments found.</p>
          ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">ID</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Status</th><th className="py-2.5 px-3">Earned ROI</th><th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-xs">{inv.referenceKey || inv.id.substring(0,8)}</td>
                    <td className="py-2.5 px-3">${Number(inv.amount).toFixed(2)}</td>
                    <td className="py-2.5 px-3"><Badge variant={inv.status === 'ACTIVE' ? 'success' : 'default'}>{inv.status}</Badge></td>
                    <td className="py-2.5 px-3">${Number(inv.roiReceived).toFixed(2)}</td>
                    <td className="py-2.5 px-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
