import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId || !['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')
    
    let whereClause = {}
    if (statusParam && statusParam !== 'ALL') {
      whereClause = { status: statusParam }
    }

    const withdrawals = await db.withdrawal.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, username: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(withdrawals)
  } catch (error) {
    console.error('Admin Withdrawals Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
