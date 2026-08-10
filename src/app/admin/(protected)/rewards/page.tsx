'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [triggering, setTriggering] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleTriggerRewards = () => {
    setShowConfirm(true);
  };

  const executeRewardsTrigger = async () => {
    setTriggering(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/rewards', { method: 'POST' });
      if (res.ok) {
        setMsg({ text: '🎉 Rewards processed successfully!', type: 'success' });
      } else {
        setMsg({ text: 'Failed to process rewards.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setMsg({ text: 'Error triggering rewards.', type: 'error' });
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

      {msg.text && (
        <div className={`p-4 rounded-md ${msg.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full space-y-4 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">⚠️ Confirm Action</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to trigger system-wide rewards calculation? This might take a while.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={() => { setShowConfirm(false); executeRewardsTrigger(); }}>Confirm</Button>
            </div>
          </Card>
        </div>
      )}

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
