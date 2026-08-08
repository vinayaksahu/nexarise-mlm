'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TeamPage() {
  const refLink = 'http://localhost:3000/register?ref=MYCODE';

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Team & Direct Referrals</h1>
      
      <Card>
        <CardHeader><CardTitle>Share Referral Link</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          <input className="flex-1 px-3 py-2 border rounded" readOnly value={refLink} />
          <Button onClick={() => navigator.clipboard.writeText(refLink)}>Copy Link</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Direct Referrals</CardTitle></CardHeader><CardContent>10</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Directs</CardTitle></CardHeader><CardContent>5</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Downline Volume</CardTitle></CardHeader><CardContent>$5000</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Direct Referrals</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Email</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>Jane Doe</td><td>jane_d</td><td>jane@ext.com</td><td>ACTIVE</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
