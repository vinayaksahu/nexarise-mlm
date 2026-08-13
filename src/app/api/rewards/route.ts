import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getBusinessConfig } from '@/lib/business-plan'
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

    // If DB is empty, sync from active business plan config
    if (rewards.length === 0) {
      const config = await getBusinessConfig()
      const planRewards = config.achievementRewards || []
      const activeRewards = planRewards.filter(r => r.isActive !== false)

      for (let i = 0; i < activeRewards.length; i++) {
        const r = activeRewards[i]
        const idKey = r.name.toLowerCase().trim().replace(/\s+/g, '-')
        await db.rewardDefinition.upsert({
          where: { id: idKey },
          update: {
            name: r.name,
            businessRequired: r.volumeRequired,
            rewardAmount: r.rewardAmount,
            sortOrder: i + 1,
            isActive: true,
          },
          create: {
            id: idKey,
            name: r.name,
            businessRequired: r.volumeRequired,
            rewardAmount: r.rewardAmount,
            sortOrder: i + 1,
            isActive: true,
            createdAt: new Date(),
          }
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
