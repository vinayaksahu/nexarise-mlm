import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [directReferrals, businessVolume] = await Promise.all([
      db.user.findMany({
        where: { sponsorId: session.userId, role: 'USER' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          mobile: true,
          status: true,
          createdAt: true,
          investments: {
            where: { status: 'ACTIVE' },
            select: { amount: true, status: true }
          }
        },
      }),
      db.businessVolume.findUnique({
        where: { userId: session.userId },
      })
    ])

    return NextResponse.json({
      directReferrals,
      businessVolume: businessVolume || {
        totalBusiness: 0,
        directBusiness: 0,
        strongLeg: 0,
        weakLeg: 0,
      },
    })
  } catch (error) {
    console.error('Fetch team error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
