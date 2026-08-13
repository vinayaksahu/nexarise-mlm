import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'
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
    const { action, status, adminNote } = body
    
    const effectiveAction = action || (status === 'APPROVED' ? 'approve' : status === 'REJECTED' ? 'reject' : null)
    
    if (effectiveAction !== 'approve' && effectiveAction !== 'reject') {
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
    if (effectiveAction === 'approve') {
      updatedDeposit = await db.$transaction(async (tx) => {
        let wallet = await tx.wallet.findUnique({
          where: { userId: deposit.userId },
          select: { id: true, p2pBalance: true },
        })
        
        if (!wallet) {
          wallet = await tx.wallet.create({
            data: {
              userId: deposit.userId,
              availableBalance: 0,
              p2pBalance: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            select: { id: true, p2pBalance: true },
          })
        }
        
        const balanceBefore = new Decimal(wallet.p2pBalance?.toString() || '0')
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
          data: { p2pBalance: balanceAfter.toNumber() },
          select: { id: true, p2pBalance: true },
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

    // Remove pending admin request notification from notification bar
    await db.notification.deleteMany({
      where: { eventId: `dep_admin_${deposit.id}` },
    })

    if (effectiveAction === 'approve') {
      await createNotification({
        userId: deposit.userId,
        title: 'Deposit Approved',
        message: `Your deposit of $${Number(deposit.amount).toFixed(2)} has been approved and credited to your wallet.`,
        type: 'DEPOSIT',
        link: '/deposits',
        eventId: `dep_approved_${deposit.id}`,
      })
    } else {
      await createNotification({
        userId: deposit.userId,
        title: 'Deposit Rejected',
        message: `Your deposit request of $${Number(deposit.amount).toFixed(2)} has been rejected.`,
        type: 'DEPOSIT',
        link: '/deposits',
        eventId: `dep_rejected_${deposit.id}`,
      })
    }

    return NextResponse.json(updatedDeposit)
  } catch (error: any) {
    console.error('Update deposit error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
