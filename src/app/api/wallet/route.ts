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

    return NextResponse.json({ wallet })
  } catch (error) {
    console.error('Fetch wallet error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
