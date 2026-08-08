'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  const fetchInvestments = async () => {
    try {
      const res = await fetch('/api/admin/investments');
      if (res.ok) {
        const data = await res.json();
        setInvestments(data.investments || []);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Investments Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total System Investments</h3>
          <p className="text-2xl font-bold">${Number(stats.totalInvested || 0).toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Investments Count</h3>
          <p className="text-2xl font-bold">{stats.activeCount || 0}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total ROI Distributed</h3>
          <p className="text-2xl font-bold">${Number(stats.totalRoi || 0).toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Plan Version</h3>
          <p className="text-2xl font-bold">v{stats.activePlanVersion || 'N/A'}</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Start Date</th>
                <th className="p-4 text-left">Daily ROI</th>
                <th className="p-4 text-left">Earned ROI</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => {
                const earnedRoi = inv.roiTransactions?.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) || 0;
                return (
                  <tr key={inv.id} className="border-b">
                    <td className="p-4 text-sm">{inv.id.substring(0, 8)}</td>
                    <td className="p-4">
                      <div>{inv.user?.name}</div>
                      <div className="text-sm text-gray-500">@{inv.user?.username}</div>
                    </td>
                    <td className="p-4 font-bold">${Number(inv.amount).toFixed(2)}</td>
                    <td className="p-4"><Badge>{inv.status}</Badge></td>
                    <td className="p-4">{new Date(inv.startDate).toLocaleDateString()}</td>
                    <td className="p-4">{inv.planVersion?.config?.dailyRoiPercent || 0}%</td>
                    <td className="p-4 text-green-600">${earnedRoi.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
