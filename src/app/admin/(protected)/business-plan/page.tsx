'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AdminBusinessPlanPage() {
  const [config, setConfig] = useState({
    dailyRoiPercent: 0,
    durationDays: 0,
    minInvestment: 0,
    maxInvestment: 0,
    withdrawalFeePercent: 0,
    p2pFeePercent: 0,
    showP2pFee: false,
    showWithdrawalFee: false,
    levelIncomes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });

  const fetchActivePlan = async () => {
    try {
      const res = await fetch('/api/admin/business-plan/active'); // Assuming an endpoint exists
      if (res.ok) {
        const data = await res.json();
        if (data.plan && data.plan.config) {
          setConfig({
            ...config,
            ...data.plan.config,
            levelIncomes: data.plan.config.levelIncomes || config.levelIncomes,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const handleSave = async () => {
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/business-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setMsg({ text: '✅ New business plan version activated!', type: 'success' });
        fetchActivePlan();
      } else {
        setMsg({ text: 'Failed to update business plan.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setMsg({ text: 'Failed to update business plan.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Business Plan Editor</h1>
      
      {msg.text && (
        <div className={`p-4 rounded-md ${msg.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
          {msg.text}
        </div>
      )}

      <Card className="p-6 max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Investment Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Daily ROI (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.dailyRoiPercent} 
                onChange={e => setConfig({...config, dailyRoiPercent: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (Days)</label>
              <Input 
                type="number" 
                value={config.durationDays} 
                onChange={e => setConfig({...config, durationDays: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Investment ($)</label>
              <Input 
                type="number" 
                value={config.minInvestment} 
                onChange={e => setConfig({...config, minInvestment: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Investment ($)</label>
              <Input 
                type="number" 
                value={config.maxInvestment} 
                onChange={e => setConfig({...config, maxInvestment: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Withdrawal Fee (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.withdrawalFeePercent} 
                onChange={e => setConfig({...config, withdrawalFeePercent: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">P2P Fee (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.p2pFeePercent} 
                onChange={e => setConfig({...config, p2pFeePercent: parseFloat(e.target.value)})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={config.showWithdrawalFee} 
                onChange={e => setConfig({...config, showWithdrawalFee: e.target.checked})}
              />
              <label className="text-sm font-medium">Show Withdrawal Fee</label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={config.showP2pFee} 
                onChange={e => setConfig({...config, showP2pFee: e.target.checked})}
              />
              <label className="text-sm font-medium">Show P2P Fee</label>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Level Income Percentages (L1 - L10)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {config.levelIncomes.map((perc, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium mb-1">Level {idx + 1}</label>
                <Input 
                  type="number" step="0.1"
                  value={perc} 
                  onChange={e => {
                    const newLevels = [...config.levelIncomes];
                    newLevels[idx] = parseFloat(e.target.value) || 0;
                    setConfig({...config, levelIncomes: newLevels});
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>Save as New Version</Button>
        </div>
      </Card>
    </div>
  );
}
