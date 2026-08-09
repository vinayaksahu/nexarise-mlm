import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const typeParam = url.searchParams.get('type')
    const skip = (page - 1) * limit

    const where: any = { userId: session.userId }
    if (typeParam && typeParam !== 'ALL' && typeParam !== 'All') {
      const upper = typeParam.toUpperCase().replace(/\s+/g, '_')
      if (upper === 'DEPOSIT') {
        where.type = { in: ['DEPOSIT', 'DEPOSIT_TO_P2P'] }
      } else if (upper === 'REWARD' || upper === 'REWARD_INCOME') {
        where.type = { in: ['REWARD', 'REWARD_INCOME'] }
      } else if (upper === 'P2P_SENT') {
        where.type = { in: ['P2P_SENT', 'P2P_TRANSFER_SENT'] }
      } else if (upper === 'P2P_RECEIVED') {
        where.type = { in: ['P2P_RECEIVED', 'P2P_TRANSFER_RECEIVED'] }
      } else if (upper === 'WITHDRAWAL') {
        where.type = { in: ['WITHDRAWAL', 'REFUND'] }
      } else {
        where.type = upper
      }
    }

    const [entries, total] = await Promise.all([
      db.ledgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.ledgerEntry.count({ where }),
    ])

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Fetch transactions error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
