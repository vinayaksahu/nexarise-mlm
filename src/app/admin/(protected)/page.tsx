'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalInvestment: 0,
    activeInvestment: 0,
    totalDeposits: 0,
    pendingDeposits: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    roiDistributed: 0,
    levelIncome: 0,
    rewardsPaid: 0,
    totalBusiness: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data.stats) {
            setStats(data.stats)
          } else if (data.totalUsers !== undefined) {
            setStats(data)
          }
        } else {
          console.error('Failed to fetch admin stats, status:', res.status)
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const adminStats = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', isMoney: false },
    { label: 'Active Users', value: stats.activeUsers, icon: '✅', isMoney: false },
    { label: 'Promotional Activations', value: (stats as any).activePromotions || 0, icon: '🎁', isMoney: false },
    { label: 'Total Investment', value: stats.totalInvestment, icon: '💰', isMoney: true },
    { label: 'Active Investment', value: stats.activeInvestment, icon: '🔥', isMoney: true },
    { label: 'Total Deposits', value: stats.totalDeposits, icon: '📥', isMoney: true },
    { label: 'Pending Deposits', value: stats.pendingDeposits, icon: '⏳', isMoney: false },
    { label: 'Total Withdrawals', value: stats.totalWithdrawals, icon: '📤', isMoney: true },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: '⏳', isMoney: false },
    { label: 'ROI Distributed', value: stats.roiDistributed, icon: '📈', isMoney: true },
    { label: 'Level Income', value: stats.levelIncome, icon: '🏆', isMoney: true },
    { label: 'Rewards Paid', value: stats.rewardsPaid, icon: '🎁', isMoney: true },
    { label: 'Total Business', value: stats.totalBusiness, icon: '💎', isMoney: true },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-muted text-sm mt-1">System overview and management</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                {stat.isMoney ? `$${Number(stat.value || 0).toFixed(2)}` : Math.floor(Number(stat.value || 0))}
              </p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
