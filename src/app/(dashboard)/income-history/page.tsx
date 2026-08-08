'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function IncomeHistoryPage() {
  const [filter, setFilter] = useState('All');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Income History</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total ROI</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold truncate">$0.00</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total Level Income</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold truncate">$0.00</CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total Reward Income</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold truncate">$0.00</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>History</CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            {['All', 'Self ROI', 'Level Income', 'Reward Income'].map(f => (
              <Button key={f} variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)} className="text-xs py-1.5 px-3">
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Balance Before</th>
                  <th className="py-2.5 px-3">Balance After</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {/* Pagination + Data would be mapped here */}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
