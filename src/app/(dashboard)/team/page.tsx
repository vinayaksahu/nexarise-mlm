'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    
    async function loadTeamData() {
      try {
        const [resUser, resTeam] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/team'),
        ]);

        if (resUser.ok) {
          const u = await resUser.json();
          setUser(u.user);
        }
        if (resTeam.ok) {
          const t = await resTeam.json();
          setTeam(t);
        }
      } catch (err) {
        console.error('Failed to load team data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTeamData();
  }, []);

  const refCode = user?.referralCode || '';
  const refLink = `${origin}/register?ref=${refCode}`;

  const copyLink = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>Loading team network...</span>
      </div>
    );
  }

  const directs = team?.directReferrals || [];
  const activeDirects = directs.filter((d: any) => {
    const hasActiveInvestment = (d.investments || []).some((inv: any) => Number(inv.amount) > 0);
    return d.status === 'ACTIVE' && hasActiveInvestment;
  }).length;
  const businessVolume = team?.businessVolume || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Direct Team Members</h1>
          <p className="text-muted text-sm mt-1">Detailed row-wise breakdown of members registered using your referral code.</p>
        </div>
        <Link href="/genealogy">
          <Button variant="outline" size="sm">🌳 View Genealogy Tree →</Button>
        </Link>
      </div>

      {/* Referral Link Share Card */}
      <Card variant="gradient" hover={false}>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-primary dark:text-primary-light text-base sm:text-lg">
            <span>🔗 Your Referral Link</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Share this link to register new users directly under your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="w-full text-xs font-mono truncate px-3 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg flex items-center justify-between gap-2">
              <span className="truncate">{refLink}</span>
              <Badge variant="info" className="shrink-0">Code: {refCode}</Badge>
            </div>
            <Button onClick={copyLink} variant="primary" className="w-full sm:w-auto text-xs py-2 shrink-0">
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Total Direct Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
            {directs.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Active Directs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {activeDirects}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Strong Leg Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
            ${Number(businessVolume.strongLeg || 0).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[11px] sm:text-xs text-slate-400 font-medium leading-tight min-h-[1.75rem] flex items-center">
              Weak Leg Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-amber-500 truncate">
            ${Number(businessVolume.weakLeg || 0).toFixed(2)}
          </CardContent>
        </Card>
      </div>

      {/* Row-wise Direct Members Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Direct Referral List</CardTitle>
          <CardDescription className="text-xs">Complete list of users sponsored directly by your referral code.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {directs.length === 0 ? (
            <div className="text-center py-10 text-muted">
              <p className="text-4xl mb-2">👥</p>
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200">No direct team members yet</p>
              <p className="text-xs text-muted mt-1">Share your referral link above to start building your team network!</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2.5 px-3">S.No</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Mobile</th>
                    <th className="py-2.5 px-3">Active Investment</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {directs.map((m: any, idx: number) => {
                    const activeInvSum = (m.investments || []).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
                    const isEffectiveActive = m.status === 'ACTIVE' && activeInvSum > 0;
                    const effectiveStatus = isEffectiveActive ? 'ACTIVE' : (m.status === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE');
                    
                    return (
                      <tr key={m.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-3 text-muted">{idx + 1}</td>
                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">{m.name}</td>
                        <td className="py-3 px-3 font-mono text-xs text-primary">@{m.username}</td>
                        <td className="py-3 px-3 text-muted text-xs">{m.email}</td>
                        <td className="py-3 px-3 text-muted text-xs">{m.mobile || 'NA'}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          ${activeInvSum.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={effectiveStatus === 'ACTIVE' ? 'success' : effectiveStatus === 'SUSPENDED' ? 'danger' : 'warning'}>
                            {effectiveStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-xs text-muted">
                          {new Date(m.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
