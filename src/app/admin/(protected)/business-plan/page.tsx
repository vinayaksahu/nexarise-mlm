'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AdminBusinessPlanPage() {
  const defaultLevelIncomes = [30, 20, 10, 5, 5, 5, 5, 2.5, 2.5, 2.5, 2.5];
  const [config, setConfig] = useState({
    dailyRoiPercentage: 1,
    roiDurationDays: 200,
    minInvestment: 5,
    maxInvestment: 10000,
    withdrawalFeePercentage: 5,
    p2pFeePercentage: 0,
    showP2pFee: false,
    showWithdrawalFee: true,
    levelIncomePercentages: defaultLevelIncomes,
    maxLevels: 11,
  });
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });

  const fetchActivePlan = async () => {
    try {
      const res = await fetch('/api/admin/business-plan/active');
      if (res.ok) {
        const data = await res.json();
        if (data.plan && data.plan.config) {
          const cfg = data.plan.config;
          const levelPcts = cfg.levelIncomePercentages || cfg.levelIncomes || defaultLevelIncomes;
          setConfig({
            dailyRoiPercentage: cfg.dailyRoiPercentage ?? cfg.dailyRoiPercent ?? 1,
            roiDurationDays: cfg.roiDurationDays ?? cfg.durationDays ?? 200,
            minInvestment: cfg.minInvestment ?? 5,
            maxInvestment: cfg.maxInvestment ?? 10000,
            withdrawalFeePercentage: cfg.withdrawalFeePercentage ?? cfg.withdrawalFeePercent ?? 5,
            p2pFeePercentage: cfg.p2pFeePercentage ?? cfg.p2pFeePercent ?? 0,
            showP2pFee: cfg.showP2pFee ?? false,
            showWithdrawalFee: cfg.showWithdrawalFee ?? true,
            levelIncomePercentages: levelPcts,
            maxLevels: levelPcts.length,
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

    // Validate non-negative percentages
    if (config.levelIncomePercentages.some(p => typeof p !== 'number' || isNaN(p) || p < 0)) {
      setMsg({ text: '⚠️ Level income percentages cannot be negative or invalid.', type: 'error' });
      return;
    }

    try {
      const payload = {
        ...config,
        levelIncomes: config.levelIncomePercentages, // Backwards compatibility
      };

      const res = await fetch('/api/admin/business-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg({ text: '🎉 New business plan version activated successfully!', type: 'success' });
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

      <Card className="p-6 max-w-3xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Investment & Fee Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Daily ROI (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.dailyRoiPercentage} 
                onChange={e => setConfig({...config, dailyRoiPercentage: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (Days)</label>
              <Input 
                type="number" 
                value={config.roiDurationDays} 
                onChange={e => setConfig({...config, roiDurationDays: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Investment ($)</label>
              <Input 
                type="number" 
                value={config.minInvestment} 
                onChange={e => setConfig({...config, minInvestment: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Investment ($)</label>
              <Input 
                type="number" 
                value={config.maxInvestment} 
                onChange={e => setConfig({...config, maxInvestment: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Withdrawal Fee (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.withdrawalFeePercentage} 
                onChange={e => setConfig({...config, withdrawalFeePercentage: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">P2P Fee (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.p2pFeePercentage} 
                onChange={e => setConfig({...config, p2pFeePercentage: parseFloat(e.target.value) || 0})}
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
          <h2 className="text-lg font-semibold mb-4">Level Income Commission Percentages (L1 - L11)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {config.levelIncomePercentages.map((perc, idx) => (
              <div key={idx} className="p-2 border rounded-xl bg-slate-900/30">
                <label className="block text-xs font-semibold mb-1 text-slate-300">Level {idx + 1}</label>
                <Input 
                  type="number" step="0.1" min="0"
                  value={perc} 
                  onChange={e => {
                    const newLevels = [...config.levelIncomePercentages];
                    newLevels[idx] = parseFloat(e.target.value) || 0;
                    setConfig({...config, levelIncomePercentages: newLevels});
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
            Save as New Plan Version
          </Button>
        </div>
      </Card>
    </div>
  );
}
