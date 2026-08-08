'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WalletPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Wallet Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Available Balance</CardTitle></CardHeader><CardContent>$100</CardContent></Card>
        <Card><CardHeader><CardTitle>ROI Income</CardTitle></CardHeader><CardContent>$50</CardContent></Card>
        <Card><CardHeader><CardTitle>Level Income</CardTitle></CardHeader><CardContent>$20</CardContent></Card>
        <Card><CardHeader><CardTitle>Reward Income</CardTitle></CardHeader><CardContent>$10</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Income</CardTitle></CardHeader><CardContent>$80</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Withdrawals</CardTitle></CardHeader><CardContent>$20</CardContent></Card>
      </div>

      <div className="flex gap-4">
        <Link href="/deposits"><Button>Deposit</Button></Link>
        <Link href="/withdrawals"><Button variant="outline">Withdraw</Button></Link>
        <Link href="/p2p"><Button variant="outline">P2P Transfer</Button></Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <p>No recent transactions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
