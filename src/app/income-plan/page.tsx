'use client';

import React, { useState, useEffect } from 'react';
import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  const levelQualifications: string[] = planConfig?.levelQualifications || [];

  const levelIncomes = levelPercentages.map((percent, idx) => ({
    level: idx + 1,
    percent: `${percent}%`,
    requirement: levelQualifications[idx] || `${idx + 1} Direct Referral${idx === 0 ? '' : 's'}`,
  }));

  const achievementRewards = planConfig?.achievementRewards || [
    { name: 'Star', volumeRequired: 1000, rewardAmount: 25 },
    { name: 'Bronze', volumeRequired: 5000, rewardAmount: 125 },
    { name: 'Silver', volumeRequired: 10000, rewardAmount: 250 },
    { name: 'Gold', volumeRequired: 25000, rewardAmount: 625 },
    { name: 'Platinum', volumeRequired: 50000, rewardAmount: 1250 },
    { name: 'Diamond', volumeRequired: 100000, rewardAmount: 2500 },
    { name: 'Blue Diamond', volumeRequired: 250000, rewardAmount: 6250 },
    { name: 'Black Diamond', volumeRequired: 500000, rewardAmount: 12500 },
    { name: 'Crown', volumeRequired: 1000000, rewardAmount: 25000 },
    { name: 'Crown Ambassador', volumeRequired: 5000000, rewardAmount: 100000 },
  ];

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
                  <CardTitle className="text-2xl text-primary font-bold">1. Daily Self ROI</CardTitle>
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
                  <CardTitle className="text-2xl text-primary font-bold">2. Level Referral Commission</CardTitle>
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
                        </tr>
                      </thead>
                      <tbody>
                        {levelIncomes.map((item) => (
                          <tr key={item.level} className="border-b border-border/60 last:border-0 hover:bg-muted/10">
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-slate-200">Level {item.level}</td>
                            <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{item.percent}</td>
                            <td className="py-3 px-4 text-muted">{item.requirement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 3. Achievement Rewards */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b border-border">
                  <CardTitle className="text-2xl text-primary font-bold">3. Achievement Rewards</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg mb-6 text-gray-800 dark:text-slate-200">
                    Hit business volume milestones across your entire downline to unlock one-time cash bonuses.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievementRewards.map((reward: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-5 border border-gray-200 dark:border-slate-800 rounded-2xl bg-gray-50 dark:bg-slate-900/60 shadow-sm transition-all hover:border-blue-500/50">
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-gray-900 dark:text-white">{reward.name}</p>
                          <p className="text-xs text-muted">Volume: ${Number(reward.volumeRequired).toLocaleString()}</p>
                        </div>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                          ${Number(reward.rewardAmount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 4. P2P Wallet Transfer */}
            <section>
              <Card>
                <CardHeader className="bg-primary/5 border-b border-border">
                  <CardTitle className="text-2xl text-primary font-bold">4. Instant P2P Wallet Transfers</CardTitle>
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
