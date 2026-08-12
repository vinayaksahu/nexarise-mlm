'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminBusinessPlanPage() {
  const defaultLevelIncomes = [10, 3, 2, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];
  const [config, setConfig] = useState({
    dailyRoiPercentage: 1,
    roiDurationDays: 200,
    minInvestment: 5,
    maxInvestment: 1000,
    investmentMultiple: 1,
    withdrawalFeePercentage: 5,
    p2pFeePercentage: 0,
    showP2pFee: false,
    showWithdrawalFee: true,
    levelIncomePercentages: defaultLevelIncomes,
    maxLevels: 10,
  });
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [saving, setSaving] = useState(false);

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
            maxInvestment: cfg.maxInvestment ?? 1000,
            investmentMultiple: cfg.investmentMultiple ?? 1,
            withdrawalFeePercentage: cfg.withdrawalFeePercentage ?? cfg.withdrawalFeePercent ?? 5,
            p2pFeePercentage: cfg.p2pFeePercentage ?? cfg.p2pFeePercent ?? 0,
            showP2pFee: cfg.showP2pFee ?? false,
            showWithdrawalFee: cfg.showWithdrawalFee ?? true,
            levelIncomePercentages: Array.isArray(levelPcts) ? levelPcts : defaultLevelIncomes,
            maxLevels: Array.isArray(levelPcts) ? levelPcts.length : 10,
          });
        }
      }
    } catch (e) {
      console.error('Fetch active plan error:', e);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const handleAddLevel = () => {
    const lastVal = config.levelIncomePercentages[config.levelIncomePercentages.length - 1] || 0.5;
    const newLevels = [...config.levelIncomePercentages, lastVal];
    setConfig({
      ...config,
      levelIncomePercentages: newLevels,
      maxLevels: newLevels.length,
    });
    setMsg({ text: `🎉 Added Level ${newLevels.length}`, type: 'success' });
    setTimeout(() => setMsg({ text: '', type: '' }), 2000);
  };

  const handleRemoveLevel = () => {
    if (config.levelIncomePercentages.length <= 1) {
      setMsg({ text: '⚠️ At least 1 level income level must remain.', type: 'error' });
      return;
    }
    const newLevels = config.levelIncomePercentages.slice(0, -1);
    setConfig({
      ...config,
      levelIncomePercentages: newLevels,
      maxLevels: newLevels.length,
    });
    setMsg({ text: `Removed Level ${config.levelIncomePercentages.length}`, type: 'success' });
    setTimeout(() => setMsg({ text: '', type: '' }), 2000);
  };

  const handleSave = async () => {
    setMsg({ text: '', type: '' });

    if (config.levelIncomePercentages.some(p => typeof p !== 'number' || isNaN(p) || p < 0)) {
      setMsg({ text: '⚠️ Level income percentages cannot be negative or invalid.', type: 'error' });
      return;
    }

    setSaving(true);
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
      console.error('Save business plan error:', e);
      setMsg({ text: 'Failed to update business plan.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Plan Editor</h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Configure ROI rates, investment caps, fees, and dynamic multi-level referral income percentages.
          </p>
        </div>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl text-xs font-medium ${msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'}`}>
          {msg.text}
        </div>
      )}

      <Card className="p-6 max-w-4xl space-y-6">
        {/* Investment & Fee Settings */}
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 border-b border-border pb-2 flex items-center gap-2">
            <span>⚙️ Investment & Fee Parameters</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Daily ROI (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.dailyRoiPercentage} 
                onChange={e => setConfig({...config, dailyRoiPercentage: parseFloat(e.target.value) || 0})}
                className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Duration (Days)</label>
              <Input 
                type="number" 
                value={config.roiDurationDays} 
                onChange={e => setConfig({...config, roiDurationDays: parseInt(e.target.value) || 0})}
                className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Min Investment ($)</label>
              <Input 
                type="number" 
                value={config.minInvestment} 
                onChange={e => setConfig({...config, minInvestment: parseFloat(e.target.value) || 0})}
                className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Max Investment ($)</label>
              <Input 
                type="number" 
                value={config.maxInvestment} 
                onChange={e => setConfig({...config, maxInvestment: parseFloat(e.target.value) || 0})}
                className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Investment Step / Multiple ($)</label>
              <Input 
                type="number" 
                value={config.investmentMultiple} 
                onChange={e => setConfig({...config, investmentMultiple: parseFloat(e.target.value) || 1})}
                className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Withdrawal Fee (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.withdrawalFeePercentage} 
                onChange={e => setConfig({...config, withdrawalFeePercentage: parseFloat(e.target.value) || 0})}
                className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">P2P Fee (%)</label>
              <Input 
                type="number" step="0.1"
                value={config.p2pFeePercentage} 
                onChange={e => setConfig({...config, p2pFeePercentage: parseFloat(e.target.value) || 0})}
                className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-4 p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-slate-300">
              <input 
                type="checkbox" 
                checked={config.showWithdrawalFee} 
                onChange={e => setConfig({...config, showWithdrawalFee: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Display Withdrawal Fee in User Panel</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-slate-300">
              <input 
                type="checkbox" 
                checked={config.showP2pFee} 
                onChange={e => setConfig({...config, showP2pFee: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Display P2P Fee in User Panel</span>
            </label>
          </div>
        </div>

        {/* Dynamic Level Income Section */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🏆 Level Income Commission Percentages (L1 - L{config.levelIncomePercentages.length})</span>
                <Badge variant="info" className="text-[10px]">{config.levelIncomePercentages.length} Levels Configured</Badge>
              </h2>
              <p className="text-xs text-muted mt-0.5">Define multi-level referral commission rates for downline network payouts.</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/40"
                disabled={config.levelIncomePercentages.length <= 1}
                onClick={handleRemoveLevel}
                title="Remove last level"
              >
                🗑️ Delete Level {config.levelIncomePercentages.length}
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs h-8 font-semibold shadow-xs"
                onClick={handleAddLevel}
              >
                ➕ Add Level {config.levelIncomePercentages.length + 1}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {config.levelIncomePercentages.map((perc, idx) => (
              <div key={idx} className="p-3 border rounded-xl bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 relative group transition-all hover:border-indigo-500/50">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-900 dark:text-slate-200">Level {idx + 1}</label>
                  {idx === config.levelIncomePercentages.length - 1 && config.levelIncomePercentages.length > 1 && (
                    <button
                      type="button"
                      onClick={handleRemoveLevel}
                      className="text-red-500 hover:text-red-700 text-xs p-0.5 font-bold"
                      title="Remove level"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input 
                    type="number" step="0.1" min="0"
                    value={perc} 
                    onChange={e => {
                      const newLevels = [...config.levelIncomePercentages];
                      newLevels[idx] = parseFloat(e.target.value) || 0;
                      setConfig({...config, levelIncomePercentages: newLevels, maxLevels: newLevels.length});
                    }}
                    className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-xs font-bold pr-6"
                  />
                  <span className="absolute right-2 top-2 text-xs text-gray-400 font-semibold">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Action */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-6 shadow-md"
          >
            {saving ? 'Activating Plan Version...' : '💾 Save as New Plan Version'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
