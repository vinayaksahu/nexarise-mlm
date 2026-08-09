import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = await db.p2PTransfer.findMany({
      where: {
        OR: [
          { senderId: session.userId },
          { receiverId: session.userId }
        ]
      },
      include: {
        sender: { select: { name: true, username: true } },
        receiver: { select: { name: true, username: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const enrichedHistory = history.map(h => ({
      ...h,
      type: h.senderId === session.userId ? 'P2P_SENT' : 'P2P_RECEIVED'
    }))

    return NextResponse.json({ transactions: enrichedHistory })
  } catch (error) {
    console.error('P2P History Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
