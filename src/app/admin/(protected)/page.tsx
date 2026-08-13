'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import {
  Users,
  CheckCircle2,
  Gift,
  Tag,
  DollarSign,
  Flame,
  ArrowDownLeft,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Trophy,
  Gem
} from 'lucide-react'

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
    { label: 'Total Users', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, isMoney: false },
    { label: 'Active Users', value: stats.activeUsers, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, isMoney: false },
    { label: 'Promotional Activations', value: (stats as any).activePromotions || 0, icon: <Gift className="w-5 h-5 text-purple-500" />, isMoney: false },
    { label: 'Promotional Investment', value: (stats as any).promotionalValue || 0, icon: <Tag className="w-5 h-5 text-indigo-500" />, isMoney: true },
    { label: 'Total Investment', value: stats.totalInvestment, icon: <DollarSign className="w-5 h-5 text-emerald-500" />, isMoney: true },
    { label: 'Active Investment (Real)', value: stats.activeInvestment, icon: <Flame className="w-5 h-5 text-amber-500" />, isMoney: true },
    { label: 'Total Deposits', value: stats.totalDeposits, icon: <ArrowDownLeft className="w-5 h-5 text-blue-500" />, isMoney: true },
    { label: 'Pending Deposits', value: stats.pendingDeposits, icon: <Clock className="w-5 h-5 text-amber-500" />, isMoney: false },
    { label: 'Total Withdrawals', value: stats.totalWithdrawals, icon: <ArrowUpRight className="w-5 h-5 text-red-500" />, isMoney: true },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: <Clock className="w-5 h-5 text-red-400" />, isMoney: false },
    { label: 'ROI Distributed', value: stats.roiDistributed, icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, isMoney: true },
    { label: 'Level Income', value: stats.levelIncome, icon: <Trophy className="w-5 h-5 text-yellow-500" />, isMoney: true },
    { label: 'Rewards Paid', value: stats.rewardsPaid, icon: <Gift className="w-5 h-5 text-cyan-500" />, isMoney: true },
    { label: 'Total Business', value: stats.totalBusiness, icon: <Gem className="w-5 h-5 text-indigo-400" />, isMoney: true },
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
        <p className="text-muted text-sm mt-1">System overview and management metrics</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <Card key={stat.label} className="hover:border-blue-500/40 transition-all">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2 shrink-0">
                {stat.icon}
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                {stat.isMoney ? `$${Number(stat.value || 0).toFixed(2)}` : Math.floor(Number(stat.value || 0))}
              </p>
              <p className="text-xs font-bold text-gray-600 dark:text-slate-300 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
