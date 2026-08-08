import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const depositSchema = z.object({
  amount: z.number().positive(),
  method: z.string().min(1),
  proofUrl: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deposits = await db.deposit.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deposits)
  } catch (error) {
    console.error('Fetch deposits error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = depositSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    
    const { amount, method, proofUrl } = result.data

    const deposit = await db.deposit.create({
      data: {
        userId: session.userId,
        amount,
        method,
        proofUrl,
        status: 'PENDING',
          createdAt: new Date(),
      },
    })

    return NextResponse.json(deposit, { status: 201 })
  } catch (error) {
    console.error('Create deposit error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
