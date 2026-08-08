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
    levelIncomes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

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
    try {
      const res = await fetch('/api/admin/business-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert('New business plan version activated!');
        fetchActivePlan();
      } else {
        alert('Failed to update business plan.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Business Plan Editor</h1>
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
