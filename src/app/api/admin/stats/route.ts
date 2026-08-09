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
      db.user.count().catch(err => { console.error('totalUsers error:', err); return 0; }),
      db.user.count({ where: { status: 'ACTIVE' } }).catch(err => { console.error('activeUsers error:', err); return 0; }),
      db.investment.aggregate({ _sum: { amount: true } }).catch(err => { console.error('totalInvestment error:', err); return { _sum: { amount: null } }; }),
      db.investment.aggregate({ where: { status: 'ACTIVE' }, _sum: { amount: true } }).catch(err => { console.error('activeInvestment error:', err); return { _sum: { amount: null } }; }),
      db.deposit.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }).catch(err => { console.error('totalDeposits error:', err); return { _sum: { amount: null } }; }),
      db.deposit.count({ where: { status: 'PENDING' } }).catch(err => { console.error('pendingDeposits error:', err); return 0; }),
      db.withdrawal.aggregate({ where: { status: { in: ['APPROVED', 'PAID'] } }, _sum: { amount: true } }).catch(err => { console.error('totalWithdrawals error:', err); return { _sum: { amount: null } }; }),
      db.withdrawal.count({ where: { status: 'PENDING' } }).catch(err => { console.error('pendingWithdrawals error:', err); return 0; }),
      db.ledgerEntry.aggregate({ where: { type: 'SELF_ROI', status: 'COMPLETED' }, _sum: { amount: true } }).catch(err => { console.error('roiDistributed error:', err); return { _sum: { amount: null } }; }),
      db.ledgerEntry.aggregate({ where: { type: 'LEVEL_INCOME', status: 'COMPLETED' }, _sum: { amount: true } }).catch(err => { console.error('levelIncome error:', err); return { _sum: { amount: null } }; }),
      db.ledgerEntry.aggregate({ where: { type: { in: ['REWARD', 'REWARD_INCOME'] }, status: 'COMPLETED' }, _sum: { amount: true } }).catch(err => { console.error('rewardsPaid error:', err); return { _sum: { amount: null } }; }),
      db.businessVolume.aggregate({ _sum: { totalBusiness: true } }).catch(err => { console.error('totalBusiness error:', err); return { _sum: { totalBusiness: null } }; })
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
