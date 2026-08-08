import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Decimal from 'decimal.js'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'FINANCE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, adminNote } = body
    
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const deposit = await db.deposit.findUnique({
      where: { id },
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    if (deposit.status !== 'PENDING') {
      return NextResponse.json({ error: 'Deposit is not pending' }, { status: 400 })
    }

    let updatedDeposit
    if (action === 'approve') {
      updatedDeposit = await db.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { userId: deposit.userId },
          select: { availableBalance: true },
        })
        
        if (!wallet) {
          throw new Error('Wallet not found for user')
        }
        
        const balanceBefore = new Decimal(wallet.availableBalance.toString())
        const depositAmount = new Decimal(deposit.amount.toString())
        const balanceAfter = balanceBefore.plus(depositAmount)
        
        const updated = await tx.deposit.update({
          where: { id },
          data: {
            status: 'APPROVED',
            adminNote,
            processedAt: new Date(),
            processedById: session.userId,
          },
        })
        
        await tx.wallet.update({
          where: { userId: deposit.userId },
          data: { availableBalance: balanceAfter.toNumber() },
        })
        
        await tx.ledgerEntry.create({
          data: {
            userId: deposit.userId,
            amount: deposit.amount,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            balanceBefore: balanceBefore.toNumber(),
            balanceAfter: balanceAfter.toNumber(),
            referenceKey: `DEP-${deposit.id}`,
            relatedEntityId: deposit.id,
            description: 'Deposit approved',
          createdAt: new Date(),
          },
        })
        
        return updated
      })
    } else {
      updatedDeposit = await db.deposit.update({
        where: { id },
        data: {
          status: 'REJECTED',
          adminNote,
          processedAt: new Date(),
          processedById: session.userId,
        },
      })
    }

    return NextResponse.json(updatedDeposit)
  } catch (error: any) {
    console.error('Update deposit error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
