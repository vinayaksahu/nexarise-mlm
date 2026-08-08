'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SelfROIPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Self ROI History</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Total Self ROI</CardTitle></CardHeader><CardContent>$150</CardContent></Card>
        <Card><CardHeader><CardTitle>Daily ROI Rate</CardTitle></CardHeader><CardContent>1.0%</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Investment</CardTitle></CardHeader><CardContent>$500</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Investments Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4">
            <p>Investment #1 ($500) - 10 / 200 days</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '5%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent ROI Distributions</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>Date</th><th>Amount</th><th>Investment ID</th></tr>
            </thead>
            <tbody>
              <tr><td>2023-10-01</td><td>$5.00</td><td>INV-1</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
