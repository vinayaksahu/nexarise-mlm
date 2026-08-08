import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getBusinessConfig } from '@/lib/business-plan'
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
    
    if (amount < config.minInvestment || amount > config.maxInvestment) {
      return NextResponse.json({ error: `Amount must be between ${config.minInvestment} and ${config.maxInvestment}` }, { status: 400 })
    }
    
    if (amount % config.investmentMultiple !== 0) {
      return NextResponse.json({ error: `Amount must be a multiple of ${config.investmentMultiple}` }, { status: 400 })
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
        select: { availableBalance: true },
      })
      
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      
      const balance = new Decimal(wallet.availableBalance.toString())
      if (balance.lessThan(investmentAmount)) {
        throw new Error('Insufficient balance')
      }
      
      const balanceBefore = balance
      const balanceAfter = balance.minus(investmentAmount)
      
      // Update wallet
      await tx.wallet.update({
        where: { userId: session.userId },
        data: { availableBalance: balanceAfter.toNumber() },
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

    return NextResponse.json(investment, { status: 201 })
  } catch (error: any) {
    console.error('Create investment error:', error)
    if (error.message === 'Insufficient balance') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
