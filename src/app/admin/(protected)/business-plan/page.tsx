'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { defaultAchievementRewards, getDefaultQualifications, AchievementRewardItem } from '@/types/business-plan';

export default function AdminBusinessPlanPage() {
  const defaultLevelIncomes = [10, 3, 2, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5];
  const [config, setConfig] = useState<{
    dailyRoiPercentage: number;
    roiDurationDays: number;
    minInvestment: number;
    maxInvestment: number;
    investmentMultiple: number;
    withdrawalFeePercentage: number;
    p2pFeePercentage: number;
    showP2pFee: boolean;
    showWithdrawalFee: boolean;
    levelIncomePercentages: number[];
    levelQualifications: string[];
    maxLevels: number;
    achievementRewards: AchievementRewardItem[];
  }>({
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
    levelQualifications: getDefaultQualifications(defaultLevelIncomes.length),
    maxLevels: defaultLevelIncomes.length,
    achievementRewards: defaultAchievementRewards,
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
          const count = Array.isArray(levelPcts) ? levelPcts.length : 11;
          const levelQuals = cfg.levelQualifications && Array.isArray(cfg.levelQualifications) && cfg.levelQualifications.length === count
            ? cfg.levelQualifications
            : getDefaultQualifications(count);

          const rewards = cfg.achievementRewards && Array.isArray(cfg.achievementRewards) && cfg.achievementRewards.length > 0
            ? cfg.achievementRewards
            : defaultAchievementRewards;

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
            levelQualifications: levelQuals,
            maxLevels: count,
            achievementRewards: rewards,
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

  // Level income actions
  const handleAddLevel = () => {
    const lastVal = config.levelIncomePercentages[config.levelIncomePercentages.length - 1] || 0.5;
    const newLevels = [...config.levelIncomePercentages, lastVal];
    const nextNum = newLevels.length;
    const newQuals = [...config.levelQualifications, `${nextNum} Direct Referral${nextNum === 1 ? '' : 's'}`];

    setConfig({
      ...config,
      levelIncomePercentages: newLevels,
      levelQualifications: newQuals,
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
    const newQuals = config.levelQualifications.slice(0, -1);

    setConfig({
      ...config,
      levelIncomePercentages: newLevels,
      levelQualifications: newQuals,
      maxLevels: newLevels.length,
    });
    setMsg({ text: `Removed Level ${config.levelIncomePercentages.length}`, type: 'success' });
    setTimeout(() => setMsg({ text: '', type: '' }), 2000);
  };

  // Achievement reward actions
  const handleAddReward = () => {
    const newRewards = [
      ...config.achievementRewards,
      { name: 'New Rank', volumeRequired: 100000, rewardAmount: 2500 }
    ];
    setConfig({ ...config, achievementRewards: newRewards });
  };

  const handleRemoveReward = (idx: number) => {
    if (config.achievementRewards.length <= 1) {
      setMsg({ text: '⚠️ At least 1 achievement reward must remain.', type: 'error' });
      return;
    }
    const newRewards = config.achievementRewards.filter((_, i) => i !== idx);
    setConfig({ ...config, achievementRewards: newRewards });
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
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Plan Editor</h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Configure ROI rates, referral level commissions, qualification requirements, and achievement reward milestones.
          </p>
        </div>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl text-xs font-medium ${msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'}`}>
          {msg.text}
        </div>
      )}

      <Card className="p-6 max-w-4xl space-y-8">
        {/* 1. Investment & Fee Settings */}
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 border-b border-border pb-2 flex items-center gap-2">
            <span>1. ⚙️ Investment & Fee Parameters</span>
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
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Investment Multiple ($)</label>
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
          </div>
        </div>

        {/* 2. Level Referral Commission & Qualifications */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>2. 🏆 Level Referral Commission & Qualification Requirements</span>
                <Badge variant="info" className="text-[10px]">{config.levelIncomePercentages.length} Levels</Badge>
              </h2>
              <p className="text-xs text-muted mt-0.5">Configure commission rates and qualification requirements per level.</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/40"
                disabled={config.levelIncomePercentages.length <= 1}
                onClick={handleRemoveLevel}
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

          <div className="space-y-2">
            {config.levelIncomePercentages.map((perc, idx) => (
              <div key={idx} className="p-3 border rounded-xl bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:w-28 shrink-0">
                  <span className="text-xs font-bold text-gray-900 dark:text-slate-200">Level {idx + 1}</span>
                </div>

                <div className="flex items-center gap-2 sm:w-44 shrink-0">
                  <label className="text-[11px] text-muted font-medium shrink-0">Commission:</label>
                  <div className="relative flex-1">
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

                <div className="flex items-center gap-2 flex-1">
                  <label className="text-[11px] text-muted font-medium shrink-0">Qualification Requirement:</label>
                  <Input 
                    type="text"
                    value={config.levelQualifications[idx] || `${idx + 1} Direct Referrals`} 
                    onChange={e => {
                      const newQuals = [...config.levelQualifications];
                      newQuals[idx] = e.target.value;
                      setConfig({...config, levelQualifications: newQuals});
                    }}
                    placeholder="e.g. 1 Direct Referral"
                    className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Achievement Rewards */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>3. 🎁 Achievement Rewards</span>
                <Badge variant="info" className="text-[10px]">{config.achievementRewards.length} Ranks Configured</Badge>
              </h2>
              <p className="text-xs text-muted mt-0.5">Hit business volume milestones across downline network to unlock cash rank bonuses.</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={handleAddReward}
            >
              ➕ Add Rank Milestone
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.achievementRewards.map((reward, idx) => (
              <div key={idx} className="p-4 border rounded-xl bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Rank #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReward(idx)}
                    className="text-xs text-red-500 hover:text-red-700 font-bold"
                    title="Remove rank milestone"
                  >
                    🗑️ Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-muted mb-1">Rank Name</label>
                    <Input 
                      type="text"
                      value={reward.name} 
                      onChange={e => {
                        const newR = [...config.achievementRewards];
                        newR[idx] = { ...newR[idx], name: e.target.value };
                        setConfig({...config, achievementRewards: newR});
                      }}
                      className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted mb-1">Required Volume ($)</label>
                    <Input 
                      type="number"
                      value={reward.volumeRequired} 
                      onChange={e => {
                        const newR = [...config.achievementRewards];
                        newR[idx] = { ...newR[idx], volumeRequired: parseFloat(e.target.value) || 0 };
                        setConfig({...config, achievementRewards: newR});
                      }}
                      className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted mb-1">Cash Bonus ($)</label>
                    <Input 
                      type="number"
                      value={reward.rewardAmount} 
                      onChange={e => {
                        const newR = [...config.achievementRewards];
                        newR[idx] = { ...newR[idx], rewardAmount: parseFloat(e.target.value) || 0 };
                        setConfig({...config, achievementRewards: newR});
                      }}
                      className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
                    />
                  </div>
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
            {saving ? 'Activating Plan Version...' : '💾 Save & Activate Business Plan Version'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
