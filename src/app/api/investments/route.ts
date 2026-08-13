import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getBusinessConfig } from '@/lib/business-plan'
import { createNotification, notifyAdmins } from '@/lib/notifications'
import Decimal from 'decimal.js'
import { z } from 'zod'

const investmentSchema = z.object({
  amount: z.number().positive(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const investments = await db.investment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        amount: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      }
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error('Fetch investments error:', error)
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
    const result = investmentSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    
    const { amount } = result.data
    const config = await getBusinessConfig()
    const minInv = Number(config.minInvestment ?? 5)
    const maxInv = Number(config.maxInvestment ?? 1000)
    const invMult = Number(config.investmentMultiple ?? 1)
    
    if (amount < minInv || amount > maxInv) {
      return NextResponse.json({ error: `Amount must be between $${minInv} and $${maxInv}` }, { status: 400 })
    }
    
    if (invMult > 1 && amount % invMult !== 0) {
      return NextResponse.json({ error: `Amount must be a multiple of $${invMult}` }, { status: 400 })
    }
    
    const investmentAmount = new Decimal(amount)
    
    // Find active plan version
    const plan = await db.businessPlanVersion.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    })
    
    if (!plan) {
      return NextResponse.json({ error: 'No active business plan found' }, { status: 500 })
    }

    const investment = await db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
        select: { p2pBalance: true },
      })
      
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      
      const balance = new Decimal(wallet.p2pBalance?.toString() || '0')
      if (balance.lessThan(investmentAmount)) {
        throw new Error('Insufficient P2P Wallet balance')
      }
      
      const balanceBefore = balance
      const balanceAfter = balance.minus(investmentAmount)
      
      // Update wallet (deduct from P2P Wallet)
      await tx.wallet.update({
        where: { userId: session.userId },
        data: { p2pBalance: balanceAfter.toNumber() },
        select: { id: true, p2pBalance: true },
      })
      
      // Create Investment
      const newInvestment = await tx.investment.create({
        data: {
          userId: session.userId,
          amount: investmentAmount.toNumber(),
          status: 'ACTIVE',
          planVersionId: plan.id,
          startDate: new Date(),
          createdAt: new Date(),
        },
      })
      
      // Update User status to ACTIVE if inactive
      await tx.user.update({
        where: { id: session.userId },
        data: { status: 'ACTIVE' },
      })
      
      // Create LedgerEntry
      await tx.ledgerEntry.create({
        data: {
          userId: session.userId,
          amount: investmentAmount.toNumber(),
          type: 'INVESTMENT',
          status: 'COMPLETED',
          balanceBefore: balanceBefore.toNumber(),
          balanceAfter: balanceAfter.toNumber(),
          referenceKey: `INV-${newInvestment.id}`,
          relatedEntityId: newInvestment.id,
          description: 'Investment created',
          createdAt: new Date(),
        },
      })
      
      // Update BusinessVolume
      let userVolume = await tx.businessVolume.findUnique({
        where: { userId: session.userId },
      })
      
      if (!userVolume) {
        userVolume = await tx.businessVolume.create({
          data: {
            userId: session.userId,
            totalBusiness: investmentAmount.toNumber(),
            directBusiness: investmentAmount.toNumber(),
            strongLeg: 0,
            weakLeg: 0,
            updatedAt: new Date(),
          },
        })
      } else {
        await tx.businessVolume.update({
          where: { userId: session.userId },
          data: {
            totalBusiness: { increment: investmentAmount.toNumber() },
            directBusiness: { increment: investmentAmount.toNumber() },
            updatedAt: new Date(),
          },
        })
      }
      
      return newInvestment
    })

    const userObj = await db.user.findUnique({
      where: { id: session.userId },
      select: { username: true },
    })

    // Trigger Real Event Notifications
    await createNotification({
      userId: session.userId,
      title: 'Investment Created',
      message: `Your investment of $${amount.toFixed(2)} has been created successfully.`,
      type: 'INVESTMENT',
      link: '/investments',
      eventId: `inv_created_${investment.id}`,
    })

    if (investment.status === 'ACTIVE') {
      await createNotification({
        userId: session.userId,
        title: 'Investment Activated',
        message: `Your investment of $${amount.toFixed(2)} is now active.`,
        type: 'INVESTMENT',
        link: '/investments',
        eventId: `inv_activated_${investment.id}`,
      })
    }

    await notifyAdmins({
      title: 'New Investment Created',
      message: `New investment of $${amount.toFixed(2)} created by @${userObj?.username || 'user'}.`,
      type: 'INVESTMENT',
      link: '/admin/investments',
      permission: 'investments.view',
      eventId: `inv_admin_${investment.id}`,
    })

    return NextResponse.json(investment, { status: 201 })
  } catch (error: any) {
    console.error('Create investment error:', error)
    if (error.message && error.message.includes('Insufficient')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
