'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RewardsPage() {
  const claimReward = () => alert('Claimed reward!');

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Rewards & Achievements</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Strong Leg</CardTitle></CardHeader><CardContent>$1500</CardContent></Card>
        <Card><CardHeader><CardTitle>Weak Leg</CardTitle></CardHeader><CardContent>$800</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Business</CardTitle></CardHeader><CardContent>$2300</CardContent></Card>
      </div>

      <Button onClick={claimReward}>Claim Eligible Rewards</Button>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Star Rank (Target: $200 Matching)</CardTitle></CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p>Reward: $25</p>
              <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <Badge className="bg-green-500">CLAIMED</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Silver Star (Target: $500 Matching)</CardTitle></CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p>Reward: $75</p>
              <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <Button onClick={claimReward}>Claim Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
