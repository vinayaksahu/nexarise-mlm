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
    const rewards = await db.rewardDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

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
