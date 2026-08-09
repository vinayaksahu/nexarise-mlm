import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalUsers,
      activeUsers,
      totalInvestmentResult,
      activeInvestmentResult,
      totalDepositsResult,
      pendingDeposits,
      totalWithdrawalsResult,
      pendingWithdrawals,
      roiDistributedResult,
      levelIncomeResult,
      rewardsPaidResult,
      totalBusinessResult
    ] = await Promise.all([
      db.user.count({ where: { role: 'USER' } }),
      db.user.count({ where: { role: 'USER', status: 'ACTIVE' } }),
      db.investment.aggregate({ _sum: { amount: true } }),
      db.investment.aggregate({ where: { status: 'ACTIVE' }, _sum: { amount: true } }),
      db.deposit.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      db.deposit.count({ where: { status: 'PENDING' } }),
      db.withdrawal.aggregate({ where: { status: { in: ['APPROVED', 'PAID'] } }, _sum: { amount: true } }),
      db.withdrawal.count({ where: { status: 'PENDING' } }),
      db.ledgerEntry.aggregate({ where: { type: 'SELF_ROI', status: 'COMPLETED' }, _sum: { amount: true } }),
      db.ledgerEntry.aggregate({ where: { type: 'LEVEL_INCOME', status: 'COMPLETED' }, _sum: { amount: true } }),
      db.ledgerEntry.aggregate({ where: { type: { in: ['REWARD', 'REWARD_INCOME'] }, status: 'COMPLETED' }, _sum: { amount: true } }),
      db.businessVolume.aggregate({ _sum: { totalBusiness: true } })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalInvestment: totalInvestmentResult._sum.amount || 0,
        activeInvestment: activeInvestmentResult._sum.amount || 0,
        totalDeposits: totalDepositsResult._sum.amount || 0,
        pendingDeposits,
        totalWithdrawals: totalWithdrawalsResult._sum.amount || 0,
        pendingWithdrawals,
        roiDistributed: roiDistributedResult._sum.amount || 0,
        levelIncome: levelIncomeResult._sum.amount || 0,
        rewardsPaid: rewardsPaidResult._sum.amount || 0,
        totalBusiness: totalBusinessResult._sum.totalBusiness || 0
      }
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
