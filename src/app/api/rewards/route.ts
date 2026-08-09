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
    const defaultRewards = [
      { name: 'Silver', businessRequired: 5000, rewardAmount: 200, sortOrder: 1 },
      { name: 'Gold', businessRequired: 10000, rewardAmount: 400, sortOrder: 2 },
      { name: 'Platinum', businessRequired: 20000, rewardAmount: 700, sortOrder: 3 },
      { name: 'Diamond', businessRequired: 50000, rewardAmount: 1000, sortOrder: 4 },
    ]

    let rewards = await db.rewardDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    // If rewards don't match the 4 standard ranks or are seeded with old thresholds, recreate standard 4 ranks
    const isOutdated = rewards.length !== 4 || rewards.some(r => !['Silver', 'Gold', 'Platinum', 'Diamond'].includes(r.name));

    if (rewards.length === 0 || isOutdated) {
      await db.rewardDefinition.updateMany({
        data: { isActive: false }
      })

      for (const r of defaultRewards) {
        await db.rewardDefinition.upsert({
          where: { id: r.name.toLowerCase() },
          update: { ...r, isActive: true },
          create: { id: r.name.toLowerCase(), ...r, isActive: true, createdAt: new Date() }
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
