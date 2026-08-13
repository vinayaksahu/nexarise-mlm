'use client';

import React, { useState, useEffect } from 'react';
import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDirectReferrals } from '@/types/business-plan';

export default function IncomePlanPage() {
  const [planConfig, setPlanConfig] = useState<any>(null);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch('/api/business-plan');
        if (res.ok) {
          const data = await res.json();
          setPlanConfig(data);
        }
      } catch (err) {
        console.error('Failed to fetch plan config:', err);
      }
    }
    fetchPlan();
  }, []);

  const dailyRoiPercent = planConfig?.dailyRoiPercentage ?? planConfig?.dailyRoiPercent ?? 1.0;
  const roiDurationDays = planConfig?.roiDurationDays ?? 200;
  const minInvestment = planConfig?.minInvestment ?? 5;
  const maxInvestment = planConfig?.maxInvestment ?? 1000;
  const p2pFeePercent = planConfig?.p2pFeePercentage ?? planConfig?.p2pFeePercent ?? 0;
  const levelPercentages: number[] = planConfig?.levelIncomePercentages || [10, 3, 2, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5];
  const minDirects: number[] = planConfig?.minDirectReferralsForLevel || [];
  const levelQualifications: string[] = planConfig?.levelQualifications || [];
  const requireSelfInvestment = planConfig?.requireSelfInvestmentForLevelIncome ?? false;
  const requiredSelfInvestments: number[] = planConfig?.requiredSelfInvestmentForLevel || [];

  const levelIncomes = levelPercentages.map((percent, idx) => {
    const directCount = minDirects[idx] !== undefined ? minDirects[idx] : idx + 1;
    const reqText = levelQualifications[idx] || formatDirectReferrals(directCount);
    return {
      level: idx + 1,
      percent: `${percent}%`,
      requirement: reqText,
      selfInvestment: requiredSelfInvestments[idx] ? `$${Number(requiredSelfInvestments[idx]).toLocaleString()}` : '$0',
    };
  });

  const rawRewards = planConfig?.achievementRewards || [
    { name: 'Star', volumeRequired: 1000, rewardAmount: 25, isActive: true },
    { name: 'Bronze', volumeRequired: 5000, rewardAmount: 125, isActive: true },
    { name: 'Silver', volumeRequired: 10000, rewardAmount: 250, isActive: true },
    { name: 'Gold', volumeRequired: 25000, rewardAmount: 625, isActive: true },
    { name: 'Platinum', volumeRequired: 50000, rewardAmount: 1250, isActive: true },
    { name: 'Diamond', volumeRequired: 100000, rewardAmount: 2500, isActive: true },
    { name: 'Blue Diamond', volumeRequired: 250000, rewardAmount: 6250, isActive: true },
    { name: 'Black Diamond', volumeRequired: 500000, rewardAmount: 12500, isActive: true },
    { name: 'Crown', volumeRequired: 1000000, rewardAmount: 25000, isActive: true },
    { name: 'Crown Ambassador', volumeRequired: 5000000, rewardAmount: 100000, isActive: true },
  ];

  const achievementRewards = rawRewards.filter((r: any) => r.isActive !== false);

  const getRankEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('star')) return '⭐';
    if (lower.includes('bronze')) return '🥉';
    if (lower.includes('silver')) return '🥈';
    if (lower.includes('gold')) return '🥇';
    if (lower.includes('platinum')) return '💎';
    if (lower.includes('blue diamond')) return '💠';
    if (lower.includes('black diamond')) return '🖤';
    if (lower.includes('diamond')) return '🔷';
    if (lower.includes('crown ambassador')) return '👑✨';
    if (lower.includes('crown')) return '👑';
    return '🏆';
  };

  const totalReturnPercent = (dailyRoiPercent * roiDurationDays).toFixed(0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <PublicNav />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">NexaRise Income Plan</h1>
            <p className="text-xl text-muted">Four powerful ways to build your wealth.</p>
          </div>

          <div className="space-y-12">
            {/* 1. Daily ROI */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b border-border">
                  <CardTitle className="text-2xl text-primary font-bold flex items-center gap-2">
                    <span>⚡ 1. Daily Self ROI</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg mb-4 text-gray-800 dark:text-slate-200">
                    Earn a consistent, automated return on your active investment packages.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted">
                    <li><strong>Daily Return:</strong> {dailyRoiPercent}% per day</li>
                    <li><strong>Duration:</strong> {roiDurationDays} Days</li>
                    <li><strong>Total Return:</strong> {totalReturnPercent}% (Includes Principal)</li>
                    <li><strong>Investment Range:</strong> ${minInvestment.toFixed(2)} to ${maxInvestment.toFixed(2)}</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* 2. Level Income */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b border-border">
                  <CardTitle className="text-2xl text-primary font-bold flex items-center gap-2">
                    <span>👥 2. Level Referral Commission</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg mb-4 text-gray-800 dark:text-slate-200">
                    Earn instant commissions when your team members make an investment. Build deep to unlock up to {levelIncomes.length} levels of commissions.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Level</th>
                          <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Commission</th>
                          <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Qualification Requirement</th>
                          {requireSelfInvestment && (
                            <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Required Self Investment</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {levelIncomes.map((item) => (
                          <tr key={item.level} className="border-b border-border/60 last:border-0 hover:bg-muted/10">
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-slate-200">Level {item.level}</td>
                            <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{item.percent}</td>
                            <td className="py-3 px-4 text-muted">{item.requirement}</td>
                            {requireSelfInvestment && (
                              <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">{item.selfInvestment}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 3. Achievement Rewards */}
            {achievementRewards.length > 0 && (
              <section>
                <Card className="overflow-hidden border border-border shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border-b border-border">
                    <CardTitle className="text-2xl text-primary font-bold flex items-center gap-2">
                      <span>🎁 3. Achievement Rewards & Rank Cash Bonuses</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8">
                    <p className="text-base sm:text-lg mb-6 text-gray-800 dark:text-slate-200">
                      Hit business volume milestones across your entire downline team <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">(50% max volume contribution per leg)</span> to unlock direct cash bonuses! 🚀
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {achievementRewards.map((reward: any, i: number) => {
                        const emoji = getRankEmoji(reward.name);
                        return (
                          <div 
                            key={i} 
                            className="group relative p-5 border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/80 shadow-xs hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                {emoji}
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
                                  <span>{reward.name}</span>
                                </h4>
                                <p className="text-xs text-muted font-medium flex items-center gap-1 mt-0.5">
                                  <span>📊 Volume:</span>
                                  <span className="font-bold text-gray-900 dark:text-slate-300">${Number(reward.volumeRequired).toLocaleString()}</span>
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider block">Bonus</span>
                              <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                                ${Number(reward.rewardAmount).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* 4. P2P Wallet Transfer */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b border-border">
                  <CardTitle className="text-2xl text-primary font-bold flex items-center gap-2">
                    <span>💸 4. Instant P2P Wallet Transfers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg mb-4 text-gray-800 dark:text-slate-200">
                    Move your funds instantly between NexaRise members. Use your Main Wallet balance to help new members activate their accounts instantly.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted">
                    <li><strong>Speed:</strong> Instant, zero-delay processing</li>
                    <li><strong>Transfer Fee:</strong> {p2pFeePercent > 0 ? `${p2pFeePercent}% flat fee` : 'Free (0% fee)'}</li>
                    <li><strong>Convenience:</strong> Bypass external crypto network fees and delays</li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Start Building Your Empire Today</h3>
            <Link href="/register">
              <Button size="lg" className="px-12 py-6 text-lg rounded-full">
                Register Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
