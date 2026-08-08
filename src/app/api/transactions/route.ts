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
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const [entries, total] = await Promise.all([
      db.ledgerEntry.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.ledgerEntry.count({
        where: { userId: session.userId },
      }),
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
