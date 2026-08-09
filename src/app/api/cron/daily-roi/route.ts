import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getBusinessConfig } from '@/lib/business-plan'
import { distributeLevelIncome } from '@/lib/level-income'
import Decimal from 'decimal.js'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const secret = process.env.CRON_SECRET
    
    if (secret && authHeader !== `Bearer ${secret}` && request.nextUrl.searchParams.get('secret') !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await getBusinessConfig()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateString = today.toISOString().split('T')[0]

    const investments = await db.investment.findMany({
      where: {
        status: 'ACTIVE',
        user: { status: 'ACTIVE' },
        OR: [
          { lastRoiDate: { lt: today } },
          { lastRoiDate: null }
        ]
      },
      include: {
        user: { select: { id: true, status: true } }
      }
    })

    let processedCount = 0
    let skippedCount = 0

    for (const investment of investments) {
      try {
        await db.$transaction(async (tx) => {
          const investmentAmount = new Decimal(investment.amount.toString())
          const dailyRoiPercentage = new Decimal(config.dailyRoiPercentage)
          const roiAmount = investmentAmount.mul(dailyRoiPercentage).div(100)
          
          const startDate = new Date(investment.startDate)
          const diffTime = Math.abs(today.getTime() - startDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          let newStatus = investment.status
          if (diffDays >= config.roiDurationDays) {
            newStatus = 'COMPLETED'
          }
          
          const wallet = await tx.wallet.findUnique({
            where: { userId: investment.userId },
            select: { availableBalance: true, roiIncome: true, totalIncome: true },
          })
          
          if (!wallet) throw new Error(`Wallet not found for user ${investment.userId}`)
          
          const balanceBefore = new Decimal(wallet.availableBalance.toString())
          const balanceAfter = balanceBefore.plus(roiAmount)
          
          const referenceKey = `ROI-${investment.id}-${dateString}`
          
          // Check if already processed
          const existingRoi = await tx.roiTransaction.findUnique({
            where: { investmentId_earningDate: { investmentId: investment.id, earningDate: today } }
          })
          
          if (existingRoi) {
            throw new Error(`ROI already processed for ${investment.id} on ${dateString}`)
          }
          
          const roiTransaction = await tx.roiTransaction.create({
            data: {
              investmentId: investment.id,
              userId: investment.userId,
              amount: roiAmount.toNumber(),
              earningDate: today,
              referenceKey,
              createdAt: new Date(),
            }
          })
          
          await tx.wallet.update({
            where: { userId: investment.userId },
            data: {
              availableBalance: balanceAfter.toNumber(),
              roiIncome: { increment: roiAmount.toNumber() },
              totalIncome: { increment: roiAmount.toNumber() },
            }
          })
          
          await tx.ledgerEntry.create({
            data: {
              userId: investment.userId,
              amount: roiAmount.toNumber(),
              type: 'SELF_ROI',
              status: 'COMPLETED',
              balanceBefore: balanceBefore.toNumber(),
              balanceAfter: balanceAfter.toNumber(),
              referenceKey,
              relatedEntityId: roiTransaction.id,
              description: `Daily ROI for investment ${investment.id}`,
              createdAt: new Date(),
            }
          })
          
          await tx.investment.update({
            where: { id: investment.id },
            data: {
              lastRoiDate: today,
              status: newStatus,
            }
          })
          
          // Distribute level income
          await distributeLevelIncome(tx, investment.userId, roiTransaction.id, roiAmount)
        })
        processedCount++
      } catch (err: any) {
        console.error(`Error processing ROI for investment ${investment.id}:`, err.message)
        skippedCount++
      }
    }

    return NextResponse.json({
      message: 'Daily ROI processing completed',
      processed: processedCount,
      skipped: skippedCount,
      total: investments.length,
    })
  } catch (error: any) {
    console.error('Daily ROI cron error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
