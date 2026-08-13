'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ShieldCheck, Zap, Users, Wallet, Trophy, Lock, BarChart3, ChevronRight, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const [investment, setInvestment] = useState<number>(100);
  const [planConfig, setPlanConfig] = useState<any>(null);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch('/api/business-plan');
        if (res.ok) {
          const data = await res.json();
          setPlanConfig(data);
          if (data.minInvestment) setInvestment(Math.max(100, data.minInvestment));
        }
      } catch (err) {
        console.error('Failed to fetch plan config on landing page:', err);
      }
    }
    fetchPlan();
  }, []);

  const dailyRoiPercent = planConfig?.dailyRoiPercent ?? 1.0;
  const roiDurationDays = planConfig?.roiDurationDays ?? 200;
  const minInvestment = planConfig?.minInvestment ?? 5;
  const maxInvestment = planConfig?.maxInvestment ?? 1000;
  const levelPercentages: number[] = planConfig?.levelIncomePercentages || [10, 3, 2, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];

  // Dynamic calculations
  const dailyROI = (investment * (dailyRoiPercent / 100)).toFixed(2);
  const monthlyROI = (investment * (dailyRoiPercent / 100) * 30).toFixed(2);
  const totalReturn = (investment * (dailyRoiPercent / 100) * roiDurationDays).toFixed(2);
  const totalReturnPercent = (dailyRoiPercent * roiDurationDays).toFixed(0);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PublicNav />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 -z-10" />
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Unlock Daily Growth with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                Smart Network Investments
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join NexaRise to earn consistent {dailyRoiPercent}% daily returns, build your global network, and unlock massive achievement rewards. Connect. Grow. Prosper.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full group">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full">
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Stats Banner */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">$12.5M+</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Payouts</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">45,000+</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Active Investors</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{dailyRoiPercent}%</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Daily ROI</p>
              </div>
              <div>
                <div className="flex justify-center mb-2">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Security Guarantee</p>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Calculator Widget */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-card rounded-3xl border shadow-xl overflow-hidden glassmorphism">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r">
                  <h3 className="text-2xl font-bold mb-2">Investment Calculator</h3>
                  <p className="text-muted-foreground mb-8">Calculate your potential earnings over our {roiDurationDays}-day cycle.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="flex justify-between text-sm font-medium mb-2">
                        <span>Investment Amount</span>
                        <span className="text-primary font-bold">${investment}</span>
                      </label>
                      <input 
                        type="range" 
                        min={minInvestment} 
                        max={maxInvestment} 
                        step={planConfig?.investmentStep || 1}
                        value={investment} 
                        onChange={(e) => setInvestment(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>${minInvestment}</span>
                        <span>${maxInvestment}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Or enter custom amount:</label>
                      <Input 
                        type="number" 
                        min={minInvestment} 
                        max={maxInvestment} 
                        value={investment}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if(val >= 0) setInvestment(val);
                        }}
                        className="text-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-8 md:p-12 bg-primary/5 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-muted-foreground">Daily ROI ({dailyRoiPercent}%)</span>
                      <span className="text-xl font-bold text-green-500">+${dailyROI}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-muted-foreground">Monthly Estimate (30 days)</span>
                      <span className="text-xl font-bold text-green-500">+${monthlyROI}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Return ({roiDurationDays} Days)</span>
                      <span className="text-3xl font-extrabold text-primary">${totalReturn}</span>
                    </div>
                  </div>
                  <Link href="/register" className="mt-8">
                    <Button className="w-full" size="lg">Start Earning Today</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Income Streams Showcase */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Multiple Income Streams</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Maximize your wealth with our powerful 4-way earning system.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">1. Daily Self ROI</h3>
                  <p className="text-muted-foreground mb-4">Earn a fixed {dailyRoiPercent}% daily return on your active investment for {roiDurationDays} consecutive days.</p>
                  <p className="font-semibold text-primary">Up to {totalReturnPercent}% Total Return</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">2. Level Commission</h3>
                  <p className="text-muted-foreground mb-4">Earn from your network {levelPercentages.length} levels deep. Get {levelPercentages[0]}% from direct referrals instantly.</p>
                  <p className="font-semibold text-primary">Uncapped Networking Income</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">3. Achievement Rewards</h3>
                  <p className="text-muted-foreground mb-4">Hit business volume targets to unlock massive cash bonuses from $25 up to $100,000.</p>
                  <p className="font-semibold text-primary">10 Prestigious Ranks</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/income-plan">
                <Button variant="ghost" className="text-lg">
                  View full income plan details <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold">Bank-Grade Security & Instant Access</h2>
                
                <div className="flex gap-4">
                  <div className="mt-1"><Lock className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Advanced Encryption</h4>
                    <p className="text-muted-foreground">Your data and funds are protected by industry-leading AES-256 encryption.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1"><Wallet className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Instant P2P Transfers</h4>
                    <p className="text-muted-foreground">Transfer funds instantly to any other member with just a 2% fee.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1"><BarChart3 className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Transparent Ledger</h4>
                    <p className="text-muted-foreground">Every transaction is recorded immutably on our secure internal ledger system.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1"><Zap className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Automated Payouts</h4>
                    <p className="text-muted-foreground">No waiting. Withdraw your daily returns and commissions smoothly.</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border aspect-square md:aspect-[4/3] bg-gradient-to-br from-background to-muted flex items-center justify-center p-8">
                  {/* Mockup visual */}
                  <div className="w-full max-w-sm bg-card rounded-xl shadow-lg border p-6 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-sm">Dashboard</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="h-24 rounded-lg bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30 flex flex-col justify-center px-4">
                      <span className="text-xs text-muted-foreground">Total Balance</span>
                      <span className="text-2xl font-bold">$1,240.50</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Daily ROI</span>
                        <span className="text-sm font-medium text-green-500">+$1.00</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Level Income</span>
                        <span className="text-sm font-medium text-green-500">+$15.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Financial Future?</h2>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join thousands of investors worldwide who are already experiencing the power of NexaRise.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 rounded-full font-bold">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
