import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Decimal from 'decimal.js'
import { logAudit } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.userId || !['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { status, adminNote } = await req.json()

    if (!['APPROVED', 'REJECTED', 'PAID'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const withdrawal = await db.withdrawal.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    let updatedWithdrawal

    if (status === 'REJECTED' && ['PENDING', 'APPROVED'].includes(withdrawal.status)) {
      updatedWithdrawal = await db.$transaction(async (tx) => {
        const wd = await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'REJECTED',
            adminNote,
            processedAt: new Date(),
            processedById: session.userId,
          }
        })

        const wallet = await tx.wallet.findUnique({
          where: { userId: withdrawal.userId },
          select: { id: true, availableBalance: true },
        })

        if (!wallet) throw new Error('User wallet not found')

        const amountDec = new Decimal(withdrawal.amount.toString())
        const balanceBeforeDec = new Decimal(wallet.availableBalance.toString())
        const balanceAfterDec = balanceBeforeDec.plus(amountDec)

        await tx.wallet.update({
          where: { userId: withdrawal.userId },
          data: { availableBalance: balanceAfterDec.toString() },
          select: { id: true, availableBalance: true },
        })

        await tx.ledgerEntry.create({
          data: {
            userId: withdrawal.userId,
            type: 'REFUND',
            amount: amountDec.toString(),
            status: 'COMPLETED',
            balanceBefore: balanceBeforeDec.toString(),
            balanceAfter: balanceAfterDec.toString(),
            referenceKey: `RFD-WD-${id}`,
            description: `Refund for rejected withdrawal #${id}`,
            createdAt: new Date(),
          }
        })

        return wd
      })
    } else if (['APPROVED', 'PAID'].includes(status)) {
      updatedWithdrawal = await db.withdrawal.update({
        where: { id },
        data: {
          status,
          adminNote,
          processedAt: new Date(),
          processedById: session.userId,
        }
      })
    } else {
       return NextResponse.json({ error: 'Invalid state transition' }, { status: 400 })
    }

    await logAudit({
      adminId: session.userId,
      action: 'UPDATE_WITHDRAWAL',
      target: `withdrawal:${id}`,
      oldValue: withdrawal.status,
      newValue: status,
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json({ message: 'Withdrawal updated successfully', withdrawal: updatedWithdrawal })
  } catch (error) {
    console.error('Update Withdrawal Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
