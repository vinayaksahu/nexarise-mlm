import { getBusinessConfig } from './business-plan'
import Decimal from 'decimal.js'

export async function distributeLevelIncome(
  tx: any, // Prisma transaction client
  sourceUserId: string,
  sourceRoiId: string,
  roiAmount: Decimal,
) {
  const config = await getBusinessConfig()
  const percentages = config.levelIncomePercentages
  
  let currentUserId = sourceUserId
  
  for (let level = 0; level < percentages.length; level++) {
    // Find sponsor (upline)
    const user = await tx.user.findUnique({
      where: { id: currentUserId },
      select: { 
        sponsorId: true,
        sponsor: { 
          select: { 
            id: true, 
            status: true,
            investments: {
              where: { status: 'ACTIVE' },
              select: { id: true, amount: true }
            }
          } 
        }
      },
    })
    
    if (!user?.sponsorId) break // No more upline
    
    const sponsorId = user.sponsorId
    const sponsor = user.sponsor
    
    // Check if sponsor is active (status === 'ACTIVE' && has active investment > 0)
    const hasActiveInv = (sponsor?.investments || []).some((inv: any) => Number(inv.amount) > 0)
    const sponsorIsActive = sponsor?.status === 'ACTIVE' && hasActiveInv

    if (!sponsorIsActive) {
      currentUserId = sponsorId
      continue
    }

    const percentage = new Decimal(percentages[level])
    const amount = roiAmount.mul(percentage).div(100)
    
    if (amount.lte(0)) {
      currentUserId = sponsorId
      continue
    }
    
    // Check if sponsor qualifies (has enough direct referrals for this level if required)
    if (config.requireDirectReferralsForLevelIncome) {
      const minRequired = config.minDirectReferralsForLevel[level] || 0
      if (minRequired > 0) {
        const directCount = await tx.user.count({
          where: { sponsorId: sponsorId, status: 'ACTIVE' },
        })
        if (directCount < minRequired) {
          currentUserId = sponsorId
          continue
        }
      }
    }
    
    const referenceKey = `LVL-${sourceRoiId}-L${level + 1}`

    // Check duplicate referenceKey
    const existing = await tx.levelIncomeTransaction.findUnique({
      where: { referenceKey }
    })
    if (existing) {
      currentUserId = sponsorId
      continue
    }
    
    // Get sponsor's wallet
    const wallet = await tx.wallet.findUnique({
      where: { userId: sponsorId },
      select: { availableBalance: true, levelIncome: true, totalIncome: true },
    })
    
    if (!wallet) {
      currentUserId = sponsorId
      continue
    }
    
    const balanceBefore = new Decimal(wallet.availableBalance.toString())
    const balanceAfter = balanceBefore.plus(amount)
    
    // Create level income transaction
    await tx.levelIncomeTransaction.create({
      data: {
        beneficiaryId: sponsorId,
        sourceUserId: sourceUserId,
        sourceRoiId: sourceRoiId,
        level: level + 1,
        percentage: percentages[level],
        amount: amount.toNumber(),
        referenceKey,
        createdAt: new Date(),
      },
    })
    
    // Update wallet
    await tx.wallet.update({
      where: { userId: sponsorId },
      data: {
        availableBalance: { increment: amount.toNumber() },
        levelIncome: { increment: amount.toNumber() },
        totalIncome: { increment: amount.toNumber() },
        updatedAt: new Date(),
      },
    })
    
    // Create ledger entry
    await tx.ledgerEntry.create({
      data: {
        userId: sponsorId,
        amount: amount.toNumber(),
        type: 'LEVEL_INCOME',
        status: 'COMPLETED',
        balanceBefore: balanceBefore.toNumber(),
        balanceAfter: balanceAfter.toNumber(),
        referenceKey,
        relatedEntityId: sourceRoiId,
        description: `Level ${level + 1} income from ${sourceUserId}`,
        createdAt: new Date(),
      },
    })
    
    currentUserId = sponsorId
  }
}
