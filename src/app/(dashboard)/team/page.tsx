'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
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
          setTeamData(t);
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
        <span>Loading team data...</span>
      </div>
    );
  }

  const directs = teamData?.directReferrals || [];
  const activeDirects = directs.filter((d: any) => d.status === 'ACTIVE').length;
  const businessVolume = teamData?.businessVolume || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Team & Direct Referrals</h1>
        <p className="text-muted text-sm mt-1">Track your network downline, share your referral link, and monitor business volume.</p>
      </div>

      {/* Share Referral Link Card */}
      <Card variant="gradient" hover={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-primary-light">
            <span>🔗 Your Direct Referral Link</span>
          </CardTitle>
          <CardDescription>
            Give this unique link to anyone you sponsor. When they register, they will be placed directly in Level 1 of your team network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="w-full text-xs font-mono truncate px-3 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg flex items-center justify-between gap-2">
              <span className="truncate">{refLink}</span>
              <Badge variant="info" className="shrink-0">Code: {refCode}</Badge>
            </div>
            <Button onClick={copyLink} variant="primary" className="w-full sm:w-auto text-xs py-2">
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Total Direct Referrals</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">{directs.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Active Directs</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">{activeDirects}</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Strong Leg Volume</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">${Number(businessVolume.strongLeg || 0).toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2"><CardTitle className="text-[11px] sm:text-xs text-muted truncate">Weak Leg Volume</CardTitle></CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 text-lg sm:text-2xl font-bold text-amber-500 truncate">${Number(businessVolume.weakLeg || 0).toFixed(2)}</CardContent>
        </Card>
      </div>

      {/* Direct Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Referral Members (Level 1)</CardTitle>
          <CardDescription>List of users directly sponsored by your referral code.</CardDescription>
        </CardHeader>
        <CardContent>
          {directs.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p className="text-3xl mb-1">👥</p>
              <p className="text-sm font-medium">No direct referrals yet.</p>
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
                    <th className="py-2.5 px-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {directs.map((member: any, index: number) => {
                    const totalActiveInvestment = member.investments?.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0) || 0;
                    return (
                    <tr key={member.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3">{index + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{member.name}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-primary">{member.username}</td>
                      <td className="py-2.5 px-3 text-muted">{member.email}</td>
                      <td className="py-2.5 px-3 text-muted">{member.mobile || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-muted">${totalActiveInvestment.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={member.status === 'ACTIVE' ? 'success' : 'danger'}>{member.status}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted">{new Date(member.createdAt).toLocaleDateString()}</td>
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
