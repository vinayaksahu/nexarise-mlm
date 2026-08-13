import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getBusinessConfig } from '@/lib/business-plan'
import { createNotification, notifyAdmins } from '@/lib/notifications'
import Decimal from 'decimal.js'
import { z } from 'zod'

const withdrawalSchema = z.object({
  amount: z.number().positive(),
  method: z.string().min(1),
  walletAddress: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const withdrawals = await db.withdrawal.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        amount: true,
        fee: true,
        netAmount: true,
        method: true,
        status: true,
        adminNote: true,
        createdAt: true,
      }
    })

    return NextResponse.json(withdrawals)
  } catch (error) {
    console.error('Fetch withdrawals error:', error)
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
    const result = withdrawalSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    
    const { amount, method, walletAddress } = result.data
    const fullMethod = walletAddress ? `${method} - ${walletAddress}` : method
    const config = await getBusinessConfig()
    
    if (amount < config.minWithdrawal) {
      return NextResponse.json({ error: `Minimum withdrawal amount is ${config.minWithdrawal}` }, { status: 400 })
    }
    
    const withdrawalAmount = new Decimal(amount)
    
    const withdrawal = await db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
        select: { id: true, availableBalance: true },
      })
      
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      
      const balance = new Decimal(wallet.availableBalance.toString())
      if (balance.lessThan(withdrawalAmount)) {
        throw new Error('Insufficient balance')
      }
      
      const feePercentage = new Decimal(config.withdrawalFeePercentage)
      const fee = withdrawalAmount.mul(feePercentage).div(100)
      const netAmount = withdrawalAmount.minus(fee)
      
      const balanceBefore = balance
      const balanceAfter = balance.minus(withdrawalAmount)
      
      // Update wallet
      await tx.wallet.update({
        where: { userId: session.userId },
        data: {
          availableBalance: balanceAfter.toNumber(),
          totalWithdrawals: { increment: withdrawalAmount.toNumber() }
        },
        select: { id: true, availableBalance: true, totalWithdrawals: true },
      })
      
      // Create Withdrawal
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId: session.userId,
          amount: withdrawalAmount.toNumber(),
          fee: fee.toNumber(),
          netAmount: netAmount.toNumber(),
          method: fullMethod,
          status: 'PENDING',
          createdAt: new Date(),
        },
      })
      
      // Create LedgerEntry for main withdrawal
      await tx.ledgerEntry.create({
        data: {
          userId: session.userId,
          amount: withdrawalAmount.toNumber(), // or netAmount depending on accounting style, usually full amount deducted
          type: 'WITHDRAWAL',
          status: 'PENDING',
          balanceBefore: balanceBefore.toNumber(),
          balanceAfter: balanceAfter.toNumber(),
          referenceKey: `WD-${newWithdrawal.id}`,
          relatedEntityId: newWithdrawal.id,
          description: 'Withdrawal request',
          createdAt: new Date(),
        },
      })
      
      // If fee > 0, we could log it separately, but deducting the full amount as WITHDRAWAL is simpler.
      // Or optionally create a WITHDRAWAL_FEE entry
      if (fee.greaterThan(0)) {
        await tx.ledgerEntry.create({
          data: {
            userId: session.userId,
            amount: fee.toNumber(),
            type: 'WITHDRAWAL_FEE',
            status: 'COMPLETED',
            balanceBefore: balanceAfter.toNumber(), // after main deduction
            balanceAfter: balanceAfter.toNumber(), // doesn't affect balance again
            referenceKey: `WDFEE-${newWithdrawal.id}`,
            relatedEntityId: newWithdrawal.id,
            description: 'Withdrawal fee',
            createdAt: new Date(),
          },
        })
      }
      
      return newWithdrawal
    })

    const userObj = await db.user.findUnique({
      where: { id: session.userId },
      select: { username: true },
    })

    // Trigger Notifications
    await createNotification({
      userId: session.userId,
      title: 'Withdrawal Requested',
      message: `Your withdrawal request of $${amount.toFixed(2)} has been submitted.`,
      type: 'WITHDRAWAL',
      link: '/withdrawals',
      eventId: `wd_submitted_${withdrawal.id}`,
    })

    await notifyAdmins({
      title: 'New Withdrawal Request',
      message: `New withdrawal request of $${amount.toFixed(2)} from @${userObj?.username || 'user'} requires review.`,
      type: 'WITHDRAWAL',
      link: '/admin/withdrawals',
      permission: 'withdrawals.approve',
      eventId: `wd_admin_${withdrawal.id}`,
    })

    return NextResponse.json(withdrawal, { status: 201 })
  } catch (error: any) {
    console.error('Create withdrawal error:', error)
    if (error.message === 'Insufficient balance') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
