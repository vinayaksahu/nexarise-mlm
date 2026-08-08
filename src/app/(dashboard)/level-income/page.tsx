'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LevelIncomePage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Level Income</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Total Level Income</CardTitle></CardHeader><CardContent>$200</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Levels</CardTitle></CardHeader><CardContent>3 / 10</CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[10, 3, 2, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5].map((pct, i) => (
          <Card key={i}>
            <CardHeader><CardTitle className="text-sm">Level {i + 1}</CardTitle></CardHeader>
            <CardContent>{pct}%</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Income Transactions</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>Level</th><th>Source User</th><th>Amount</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>user123</td><td>$5.00</td><td>2023-10-01</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
