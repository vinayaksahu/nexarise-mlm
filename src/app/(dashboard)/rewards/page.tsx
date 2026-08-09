'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RewardsPage() {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<any[]>([]);
  const [businessVolume, setBusinessVolume] = useState<any>(null);
  const [claiming, setClaiming] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/rewards');
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
        setClaimedRewards(data.claimedRewards || []);
        setBusinessVolume(data.businessVolume || {});
      }
    } catch (err) {
      console.error('Failed to load rewards data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleClaim = async () => {
    setClaiming(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/rewards', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ text: data.error || 'Claim failed', type: 'error' });
        return;
      }
      if (data.claimedRewards && data.claimedRewards.length > 0) {
        setMsg({ text: `🎉 Success! You claimed ${data.claimedRewards.length} new reward(s)!`, type: 'success' });
      } else {
        setMsg({ text: 'No new eligible rewards to claim right now. Keep growing your business volume!', type: 'info' });
      }
      loadData();
    } catch {
      setMsg({ text: 'Something went wrong while claiming rewards.', type: 'error' });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>Loading Rewards...</span>
      </div>
    );
  }

  const fmt = (val: any) => (val ? Number(val).toFixed(2) : '0.00');
  const claimedSet = new Set(claimedRewards.map((c: any) => c.rewardDefinitionId));
  const totalBus = Number(businessVolume?.totalBusiness || 0);
  const strongLeg = Number(businessVolume?.strongLeg || 0);
  const weakLeg = Number(businessVolume?.weakLeg || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Rewards & Achievements</h1>
          <p className="text-muted text-sm mt-1">Unlock rank milestone rewards as your network business volume grows.</p>
        </div>
        <Button onClick={handleClaim} loading={claiming} variant="primary" size="md">
          🎁 Check & Claim Rewards
        </Button>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl border text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' : msg.type === 'error' ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'}`}>
          {msg.text}
        </div>
      )}

      {/* Volume Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Strong Leg Volume</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">${fmt(strongLeg)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Weak Leg Volume</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-amber-500 truncate">${fmt(weakLeg)}</CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total Business Volume</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">${fmt(totalBus)}</CardContent>
        </Card>
      </div>

      {/* Reward Slabs List */}
      <Card>
        <CardHeader>
          <CardTitle>Rank Reward Slabs</CardTitle>
          <CardDescription>Achieve required business volume with 50/50 two-leg balance to claim cash bonuses directly to your wallet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rewards.map((r: any) => {
            const req = Number(r.businessRequired);
            const halfReq = req / 2;
            const amt = Number(r.rewardAmount);
            const isClaimed = claimedSet.has(r.id);
            const isQualified = totalBus >= req && strongLeg >= halfReq && weakLeg >= halfReq;
            const pct = Math.min(100, Math.round((totalBus / req) * 100));

            return (
              <div key={r.id} className="p-4 bg-gray-50 dark:bg-slate-900 border border-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white text-base">{r.name} Rank</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Bonus: ${fmt(amt)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted gap-1">
                    <span>Target: ${fmt(req)} (Min Strong: ${fmt(halfReq)} | Min Weak: ${fmt(halfReq)})</span>
                    <span>{pct}% ({fmt(totalBus)} / ${fmt(req)})</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${isClaimed ? 'bg-emerald-500' : isQualified ? 'bg-primary' : 'bg-amber-500'}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
                  {isClaimed ? (
                    <Badge variant="success" className="w-full sm:w-auto justify-center">✓ CLAIMED</Badge>
                  ) : isQualified ? (
                    <Button onClick={handleClaim} loading={claiming} variant="primary" className="w-full sm:w-auto text-xs py-2">Claim Now</Button>
                  ) : (
                    <Badge variant="default" className="w-full sm:w-auto justify-center">LOCKED</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Claimed Rewards History */}
      <Card>
        <CardHeader>
          <CardTitle>Claimed Rewards History</CardTitle>
          <CardDescription>History of milestone cash bonuses credited to your Main Wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          {claimedRewards.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p className="text-3xl mb-1">🎁</p>
              <p className="text-sm font-medium">No claimed rewards yet.</p>
              <p className="text-xs text-muted mt-1">Claimed milestone bonuses will appear here once achieved.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Reward Amount</th>
                    <th className="py-2.5 px-3">Required Business</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Ref Key</th>
                  </tr>
                </thead>
                <tbody>
                  {claimedRewards.map((c: any) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                        <Badge variant="success">{c.rewardDefinition?.name || 'Rank Reward'}</Badge>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        +${fmt(c.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-muted">
                        ${fmt(c.rewardDefinition?.businessRequired)}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-muted">
                        {c.referenceKey || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
