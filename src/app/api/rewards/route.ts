import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { checkAndClaimEligibleRewards } from '@/lib/rewards'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let rewards = await db.rewardDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    if (rewards.length === 0) {
      const defaultRewards = [
        { name: 'Silver', businessRequired: 500, rewardAmount: 50, sortOrder: 1 },
        { name: 'Gold', businessRequired: 2500, rewardAmount: 250, sortOrder: 2 },
        { name: 'Platinum', businessRequired: 10000, rewardAmount: 1000, sortOrder: 3 },
        { name: 'Diamond', businessRequired: 50000, rewardAmount: 5000, sortOrder: 4 },
      ]
      for (const r of defaultRewards) {
        await db.rewardDefinition.create({
          data: { ...r, isActive: true, createdAt: new Date() }
        })
      }
      rewards = await db.rewardDefinition.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      })
    }

    const claimedRewards = await db.rewardTransaction.findMany({
      where: { userId: session.userId },
      include: {
        rewardDefinition: true
      }
    })

    const businessVolume = await db.businessVolume.findUnique({
      where: { userId: session.userId }
    })

    return NextResponse.json({
      rewards,
      claimedRewards,
      businessVolume
    })
  } catch (error) {
    console.error('Rewards GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const claimedRewards = await checkAndClaimEligibleRewards(session.userId)
    return NextResponse.json({ claimedRewards })
  } catch (error) {
    console.error('Rewards POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
