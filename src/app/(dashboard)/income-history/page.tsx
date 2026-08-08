'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function IncomeHistoryPage() {
  const [filter, setFilter] = useState('All');
  
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Income History</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Total ROI</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">$0.00</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Level Income</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">$0.00</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Reward Income</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">$0.00</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <div className="flex space-x-2 mt-4">
            {['All', 'Self ROI', 'Level Income', 'Reward Income'].map(f => (
              <Button key={f} variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)}>
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance Before</th>
                <th>Balance After</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {/* Pagination + Data would be mapped here */}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
