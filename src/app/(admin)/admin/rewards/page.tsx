'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/admin/rewards'); // Assuming GET exists
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerRewards = async () => {
    if (!confirm('Are you sure you want to trigger system-wide rewards calculation? This might take a while.')) return;
    
    setTriggering(true);
    try {
      const res = await fetch('/api/rewards', { method: 'POST' });
      if (res.ok) {
        alert('Rewards processed successfully!');
      } else {
        alert('Failed to process rewards.');
      }
    } catch (e) {
      console.error(e);
      alert('Error triggering rewards.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rewards Management</h1>
        <Button onClick={handleTriggerRewards} disabled={triggering}>
          {triggering ? 'Processing...' : 'Trigger Rewards Calculation'}
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Level Name</th>
                <th className="p-4 text-left">Required Business (Both Legs)</th>
                <th className="p-4 text-left">Reward Amount</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length > 0 ? rewards.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-4 font-medium">{r.name}</td>
                  <td className="p-4">${Number(r.businessRequired).toFixed(2)}</td>
                  <td className="p-4 text-green-600 font-bold">${Number(r.rewardAmount).toFixed(2)}</td>
                  <td className="p-4">{r.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">No reward definitions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
