import { NextRequest, NextResponse } from 'next/server'
import { getSession, verifyPin } from '@/lib/auth'
import { db } from '@/lib/db'
import Decimal from 'decimal.js'
import { p2pTransferSchema } from '@/lib/validations'
import { logSecurityEvent } from '@/lib/audit'
import { getBusinessConfig } from '@/lib/business-plan'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = p2pTransferSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const { recipient, amount, pin } = validation.data

    const sender = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, transactionPinHash: true, status: true, wallet: true }
    })

    if (!sender || sender.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Sender not found or inactive' }, { status: 400 })
    }

    const activeInv = await db.investment.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' }
    });
    
    if (!activeInv) {
      return NextResponse.json({ error: 'Only active accounts with an active investment can perform fund transfers' }, { status: 400 });
    }

    if (!sender.transactionPinHash) {
      return NextResponse.json({ error: 'Set transaction PIN first' }, { status: 400 })
    }

    const isPinValid = await verifyPin(pin, sender.transactionPinHash)
    if (!isPinValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 })
    }

    const receiver = await db.user.findFirst({
      where: {
        OR: [
          { username: recipient },
          { email: recipient },
          { referralCode: recipient }
        ]
      },
      select: { id: true, wallet: true }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (receiver.id === sender.id) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    // Fetch business config (no fee on P2P transfer per business rule)
    const config = await getBusinessConfig()
    const p2pFeePercentage = new Decimal(0)
    const minP2pTransfer = new Decimal(config?.minP2pTransfer ?? 1)

    const transferAmount = new Decimal(amount)

    if (transferAmount.lessThan(minP2pTransfer)) {
      return NextResponse.json({ error: `Minimum transfer amount is ${minP2pTransfer.toString()}` }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: sender.id }
      })

      if (!senderWallet) {
        throw new Error('Sender wallet not found')
      }

      const p2pBalance = new Decimal(senderWallet.p2pBalance.toString())
      if (p2pBalance.lessThan(transferAmount)) {
        throw new Error('Insufficient balance')
      }

      const fee = transferAmount.mul(p2pFeePercentage).div(100)
      const netAmount = transferAmount.minus(fee)

      const receiverWallet = await tx.wallet.findUnique({
        where: { userId: receiver.id }
      })

      if (!receiverWallet) {
        throw new Error('Receiver wallet not found')
      }

      const updatedSenderWallet = await tx.wallet.update({
        where: { userId: sender.id },
        data: {
          p2pBalance: p2pBalance.minus(transferAmount).toString()
        }
      })

      const updatedReceiverWallet = await tx.wallet.update({
        where: { userId: receiver.id },
        data: {
          p2pBalance: new Decimal(receiverWallet.p2pBalance.toString()).plus(netAmount).toString()
        }
      })

      const timestamp = Date.now()

      const transfer = await tx.p2PTransfer.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          amount: transferAmount.toString(),
          fee: fee.toString(),
          netAmount: netAmount.toString(),
          referenceKey: `P2P-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
          status: 'COMPLETED',
          createdAt: new Date(),
        }
      })

      await tx.ledgerEntry.create({
        data: {
          userId: sender.id,
          type: 'P2P_SENT',
          amount: transferAmount.toString(),
          status: 'COMPLETED',
          balanceBefore: p2pBalance.toString(),
          balanceAfter: updatedSenderWallet.p2pBalance,
          referenceKey: `P2P-S-${transfer.id}`,
          createdAt: new Date(),
        }
      })

      await tx.ledgerEntry.create({
        data: {
          userId: receiver.id,
          type: 'P2P_RECEIVED',
          amount: netAmount.toString(),
          status: 'COMPLETED',
          balanceBefore: receiverWallet.p2pBalance.toString(),
          balanceAfter: updatedReceiverWallet.p2pBalance,
          referenceKey: `P2P-R-${transfer.id}`,
          createdAt: new Date(),
        }
      })

      return transfer
    })

    if (transferAmount.greaterThan(100)) {
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      const userAgent = req.headers.get('user-agent') || 'unknown'
      await logSecurityEvent({
        userId: session.userId,
        event: 'LARGE_P2P_TRANSFER',
        details: `Amount: ${transferAmount.toString()}`,
        ip,
        userAgent
      })
    }

    return NextResponse.json({ message: 'Transfer successful', transfer: result })
  } catch (error: any) {
    console.error('P2P Transfer Error:', error)
    if (error.message === 'Insufficient balance' || error.message.includes('wallet not found')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
