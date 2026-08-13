import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification, notifyAdmins } from '@/lib/notifications'
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
      take: 100,
      select: {
        id: true,
        amount: true,
        method: true,
        proofUrl: true,
        status: true,
        adminNote: true,
        createdAt: true,
      }
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

    // Check if active payment methods exist
    const activeMethodsCount = await db.paymentMethod.count({
      where: { isActive: true }
    })
    if (activeMethodsCount === 0) {
      return NextResponse.json({ error: 'Deposit payment methods are currently unavailable' }, { status: 400 })
    }

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

    const userObj = await db.user.findUnique({
      where: { id: session.userId },
      select: { username: true },
    })

    // Trigger Notifications
    await createNotification({
      userId: session.userId,
      title: 'Deposit Submitted',
      message: `Your deposit request of $${amount.toFixed(2)} has been submitted successfully.`,
      type: 'DEPOSIT',
      link: '/deposits',
      eventId: `dep_submitted_${deposit.id}`,
    })

    await notifyAdmins({
      title: 'New Deposit Request',
      message: `New deposit request of $${amount.toFixed(2)} from @${userObj?.username || 'user'} requires approval.`,
      type: 'DEPOSIT',
      link: '/admin/deposits',
      permission: 'deposits.approve',
      eventId: `dep_admin_${deposit.id}`,
    })

    return NextResponse.json(deposit, { status: 201 })
  } catch (error) {
    console.error('Create deposit error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
