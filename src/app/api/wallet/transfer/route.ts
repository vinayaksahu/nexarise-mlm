import { NextRequest, NextResponse } from 'next/server'
import { getSession, verifyPin } from '@/lib/auth'
import { db } from '@/lib/db'
import Decimal from 'decimal.js'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, pin } = await req.json()

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { transactionPinHash: true }
    })

    if (!user?.transactionPinHash) {
      return NextResponse.json({ error: 'Set transaction PIN first' }, { status: 400 })
    }

    const isPinValid = await verifyPin(pin, user.transactionPinHash)
    if (!isPinValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 })
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    try {
      await db.$executeRawUnsafe(`ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'WALLET_TRANSFER';`)
    } catch (e) {
      // Ignore if DB is SQLite or value already exists
    }

    const result = await db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.userId }
      })

      if (!wallet) {
        throw new Error('Wallet not found')
      }

      const transferAmount = new Decimal(amount)
      const availableBalance = new Decimal(wallet.availableBalance.toString())
      const currentP2p = new Decimal(wallet.p2pBalance?.toString() || '0')
      
      if (availableBalance.lessThan(transferAmount)) {
        throw new Error('Insufficient available balance')
      }

      const balanceBefore = availableBalance
      const balanceAfter = availableBalance.minus(transferAmount)

      const updatedWallet = await tx.wallet.update({
        where: { userId: session.userId },
        data: {
          availableBalance: balanceAfter.toNumber(),
          p2pBalance: currentP2p.plus(transferAmount).toNumber()
        }
      })

      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 7)
      
      try {
        await tx.ledgerEntry.create({
          data: {
            userId: session.userId,
            amount: transferAmount.toNumber(),
            type: 'WALLET_TRANSFER',
            status: 'COMPLETED',
            balanceBefore: balanceBefore.toNumber(),
            balanceAfter: balanceAfter.toNumber(),
            referenceKey: `WT-${timestamp}-${random}`,
            description: 'Transfer from Main to P2P Wallet',
            createdAt: new Date(),
          }
        })
      } catch (enumErr) {
        // Fallback for production DB if WALLET_TRANSFER Postgres ENUM value is not present
        await tx.ledgerEntry.create({
          data: {
            userId: session.userId,
            amount: transferAmount.toNumber(),
            type: 'P2P_SENT',
            status: 'COMPLETED',
            balanceBefore: balanceBefore.toNumber(),
            balanceAfter: balanceAfter.toNumber(),
            referenceKey: `WT-${timestamp}-${random}`,
            description: 'Transfer from Main to P2P Wallet',
            createdAt: new Date(),
          }
        })
      }

      return updatedWallet
    })

    return NextResponse.json({ message: 'Transfer successful', wallet: result })
  } catch (error: any) {
    console.error('Wallet Transfer Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
