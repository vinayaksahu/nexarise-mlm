import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let wallet: any
    try {
      wallet = await db.wallet.findUnique({
        where: { userId: session.userId },
      })
    } catch (e) {
      // Fallback if p2pBalance column is not yet in the DB schema
      wallet = await db.wallet.findUnique({
        where: { userId: session.userId },
        select: {
          id: true,
          userId: true,
          availableBalance: true,
          roiIncome: true,
          levelIncome: true,
          rewardIncome: true,
          totalIncome: true,
          totalWithdrawals: true,
          createdAt: true,
          updatedAt: true,
        }
      })
      if (wallet) {
        wallet.p2pBalance = 0
      }
    }

    if (!wallet) {
      wallet = await db.wallet.create({
        data: {
          userId: session.userId,
          availableBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todaysRoiAgg, totalInvAgg, p2pSentAgg, p2pRecvAgg] = await Promise.all([
      db.roiTransaction.aggregate({
        where: { userId: session.userId, earningDate: { gte: today } },
        _sum: { amount: true }
      }),
      db.investment.aggregate({
        where: { userId: session.userId },
        _sum: { amount: true }
      }),
      db.p2PTransfer.aggregate({
        where: { senderId: session.userId },
        _sum: { amount: true }
      }),
      db.p2PTransfer.aggregate({
        where: { receiverId: session.userId },
        _sum: { netAmount: true }
      })
    ])

    const walletData = {
      ...wallet,
      todaysRoi: todaysRoiAgg._sum.amount || 0,
      totalInvestments: totalInvAgg._sum.amount || 0,
      totalP2pSent: p2pSentAgg._sum.amount || 0,
      totalP2pReceived: p2pRecvAgg._sum.netAmount || 0,
    }

    return NextResponse.json({ wallet: walletData })
  } catch (error) {
    console.error('Fetch wallet error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
