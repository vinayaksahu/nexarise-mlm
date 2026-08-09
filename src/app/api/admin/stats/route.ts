import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    })

    if (!user || !['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'].includes(user.role)) {
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
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
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

    const totalInv = Number(totalInvestmentResult._sum.amount || 0)
    const totalBus = Number(totalBusinessResult._sum.totalBusiness || 0)

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalInvestment: totalInv,
        activeInvestment: Number(activeInvestmentResult._sum.amount || 0),
        totalDeposits: Number(totalDepositsResult._sum.amount || 0),
        pendingDeposits,
        totalWithdrawals: Number(totalWithdrawalsResult._sum.amount || 0),
        pendingWithdrawals,
        roiDistributed: Number(roiDistributedResult._sum.amount || 0),
        levelIncome: Number(levelIncomeResult._sum.amount || 0),
        rewardsPaid: Number(rewardsPaidResult._sum.amount || 0),
        totalBusiness: totalBus > 0 ? totalBus : totalInv
      }
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
