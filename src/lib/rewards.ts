import { db } from './db'
import Decimal from 'decimal.js'

export async function calculateLegBusiness(userId: string) {
  // Find all direct referrals of this user
  const directs = await db.user.findMany({
    where: { sponsorId: userId },
    select: { id: true, username: true, name: true }
  })

  if (directs.length === 0) {
    return { strongLeg: new Decimal(0), weakLeg: new Decimal(0), totalBusiness: new Decimal(0), legDetails: [] }
  }

  // Helper to recursively get total business volume of a subtree
  async function getSubtreeVolume(nodeUserId: string): Promise<Decimal> {
    // Self active investments total
    const selfInvestments = await db.investment.aggregate({
      where: { userId: nodeUserId, status: 'ACTIVE' },
      _sum: { amount: true }
    })
    const selfAmount = new Decimal(selfInvestments._sum.amount?.toString() || 0)

    // Downlines
    const children = await db.user.findMany({
      where: { sponsorId: nodeUserId },
      select: { id: true }
    })

    let childTotal = new Decimal(0)
    for (const child of children) {
      const childVol = await getSubtreeVolume(child.id)
      childTotal = childTotal.plus(childVol)
    }

    return selfAmount.plus(childTotal)
  }

  const legVolumes: { userId: string; username: string; volume: Decimal }[] = []
  for (const direct of directs) {
    const vol = await getSubtreeVolume(direct.id)
    legVolumes.push({ userId: direct.id, username: direct.username, volume: vol })
  }

  // Sort legs descending
  legVolumes.sort((a, b) => b.volume.minus(a.volume).toNumber())

  const strongLeg = legVolumes.length > 0 ? legVolumes[0].volume : new Decimal(0)
  let weakLeg = new Decimal(0)
  for (let i = 1; i < legVolumes.length; i++) {
    weakLeg = weakLeg.plus(legVolumes[i].volume)
  }

  const totalBusiness = strongLeg.plus(weakLeg)

  // Update BusinessVolume record for the user
  await db.businessVolume.upsert({
    where: { userId },
    update: {
      totalBusiness: totalBusiness.toNumber(),
      directBusiness: legVolumes.reduce((acc, curr) => acc.plus(curr.volume), new Decimal(0)).toNumber(),
      strongLeg: strongLeg.toNumber(),
      weakLeg: weakLeg.toNumber(),
      updatedAt: new Date(),
    },
    create: {
      userId,
      totalBusiness: totalBusiness.toNumber(),
      directBusiness: legVolumes.reduce((acc, curr) => acc.plus(curr.volume), new Decimal(0)).toNumber(),
      strongLeg: strongLeg.toNumber(),
      weakLeg: weakLeg.toNumber(),
      updatedAt: new Date(),
    }
  })

  return { strongLeg, weakLeg, totalBusiness, legDetails: legVolumes }
}

export async function checkAndClaimEligibleRewards(userId: string) {
  const { strongLeg, weakLeg, totalBusiness } = await calculateLegBusiness(userId)
  
  // Get active reward definitions sorted by sortOrder
  const rewards = await db.rewardDefinition.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  })

  // Get already claimed rewards
  const claimed = await db.rewardTransaction.findMany({
    where: { userId },
    select: { rewardDefinitionId: true }
  })
  const claimedSet = new Set(claimed.map(c => c.rewardDefinitionId))

  const newlyClaimed: any[] = []

  for (const reward of rewards) {
    if (claimedSet.has(reward.id)) continue

    const requiredBus = new Decimal(reward.businessRequired.toString())
    // 40% strong leg + 60% weak leg rule, OR total business rule
    if (totalBusiness.gte(requiredBus)) {
      // User qualifies for this reward!
      const rewardAmt = new Decimal(reward.rewardAmount.toString())
      const referenceKey = `RWD-${userId}-${reward.id}`

      try {
        await db.$transaction(async (tx) => {
          // Create RewardTransaction
          const rewardTx = await tx.rewardTransaction.create({
            data: {
              userId,
              rewardDefinitionId: reward.id,
              amount: rewardAmt.toNumber(),
              referenceKey,
              strongLeg: strongLeg.toNumber(),
              weakLeg: weakLeg.toNumber(),
              createdAt: new Date(),
            }
          })

          // Update Wallet
          const wallet = await tx.wallet.findUnique({ where: { userId } })
          const balanceBefore = new Decimal(wallet?.availableBalance?.toString() || 0)
          const balanceAfter = balanceBefore.plus(rewardAmt)

          await tx.wallet.update({
            where: { userId },
            data: {
              rewardIncome: { increment: rewardAmt.toNumber() },
              totalIncome: { increment: rewardAmt.toNumber() },
              availableBalance: { increment: rewardAmt.toNumber() },
              updatedAt: new Date(),
            }
          })

          // Create LedgerEntry
          await tx.ledgerEntry.create({
            data: {
              userId,
              amount: rewardAmt.toNumber(),
              type: 'REWARD',
              status: 'COMPLETED',
              balanceBefore: balanceBefore.toNumber(),
              balanceAfter: balanceAfter.toNumber(),
              referenceKey,
              relatedEntityId: rewardTx.id,
              description: `Achieved ${reward.name} Reward`,
              createdAt: new Date(),
            }
          })

          newlyClaimed.push(rewardTx)
        })
      } catch (err) {
        console.error(`Failed to claim reward ${reward.id} for user ${userId}:`, err)
      }
    }
  }

  return newlyClaimed
}
