'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    // Mock fetch data
    setData({
      wallet: { available: 100, activeInvestment: 500 },
      income: { roi: 50, level: 20, reward: 10, total: 80 },
      withdrawals: 20,
      team: { directs: 5, businessVolume: 2000, strongLeg: 1200, weakLeg: 800 },
      user: { referralCode: 'NEXA123' },
      transactions: []
    });
  }, []);

  const copyRefLink = () => {
    navigator.clipboard.writeText(`http://localhost:3000/register?ref=${data?.user?.referralCode}`);
    alert('Copied!');
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Available Balance</CardTitle></CardHeader><CardContent>${data.wallet.available}</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Investment</CardTitle></CardHeader><CardContent>${data.wallet.activeInvestment}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total ROI</CardTitle></CardHeader><CardContent>${data.income.roi}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Level Income</CardTitle></CardHeader><CardContent>${data.income.level}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Reward Income</CardTitle></CardHeader><CardContent>${data.income.reward}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Income</CardTitle></CardHeader><CardContent>${data.income.total}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Withdrawals</CardTitle></CardHeader><CardContent>${data.withdrawals}</CardContent></Card>
        <Card><CardHeader><CardTitle>Direct Referrals</CardTitle></CardHeader><CardContent>{data.team.directs}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Business Volume</CardTitle></CardHeader><CardContent>${data.team.businessVolume}</CardContent></Card>
        <Card><CardHeader><CardTitle>Strong Leg</CardTitle></CardHeader><CardContent>${data.team.strongLeg}</CardContent></Card>
        <Card><CardHeader><CardTitle>Weak Leg</CardTitle></CardHeader><CardContent>${data.team.weakLeg}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Referral Link</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          <input className="flex-1 px-3 py-2 border rounded" readOnly value={`http://localhost:3000/register?ref=${data.user.referralCode}`} />
          <Button onClick={copyRefLink}>Copy</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <p>No recent transactions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
