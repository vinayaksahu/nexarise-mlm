import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wallet = await db.wallet.findUnique({
      where: { userId: session.userId },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    return NextResponse.json({ wallet })
  } catch (error) {
    console.error('Fetch wallet error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
