import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding NexaRise database...')

  // 1. Create Super Admin
  const adminPasswordHash = await bcrypt.hash('Admin@2026', 12)
  const admin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { referralCode: 'superadmin' },
    create: {
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@nexarise.com',
      passwordHash: adminPasswordHash,
      referralCode: 'superadmin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log(`✅ Admin created: ${admin.username} (referral: ${admin.referralCode})`)

  // Create admin wallet
  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log('✅ Admin wallet created')

  // 2. Create Business Plan Version (default config)
  const businessPlan = await prisma.businessPlanVersion.upsert({
    where: { version: 1 },
    update: {},
    create: {
      config: {
        // Investment
        minInvestment: 5,
        maxInvestment: 1000,
        investmentMultiple: 1,
        currency: 'USD',

        // ROI
        dailyRoiPercentage: 1.0,
        roiDurationDays: 200,
        totalRoiPercentage: 200,

        // Level Income (10 levels)
        levelIncomePercentages: [10, 3, 2, 1, 1, 1, 0.5, 0.5, 0.5, 0.5],
        maxLevels: 10,

        // P2P Transfer
        p2pFeePercentage: 2,
        minP2pTransfer: 1,

        // Withdrawal
        withdrawalFeePercentage: 5,
        minWithdrawal: 5,
        maxWithdrawalPerDay: 500,

        // Business rules
        maxDirectReferralsForIncome: 100,
        requireDirectReferralsForLevelIncome: true,
        minDirectReferralsForLevel: [0, 1, 2, 3, 3, 4, 4, 5, 5, 5],
      },
      isActive: true,
      createdById: admin.id,
      createdAt: new Date(),
    },
  })
  console.log(`✅ Business Plan v${businessPlan.version} created`)

  // 3. Create Reward Definitions (4 Rank Slabs)
  const rewards = [
    { name: 'Silver', businessRequired: 500, rewardAmount: 50, sortOrder: 1 },
    { name: 'Gold', businessRequired: 2500, rewardAmount: 250, sortOrder: 2 },
    { name: 'Platinum', businessRequired: 10000, rewardAmount: 1000, sortOrder: 3 },
    { name: 'Diamond', businessRequired: 50000, rewardAmount: 5000, sortOrder: 4 },
  ]

  for (const reward of rewards) {
    await prisma.rewardDefinition.create({
      data: {
        name: reward.name,
        businessRequired: reward.businessRequired,
        rewardAmount: reward.rewardAmount,
        sortOrder: reward.sortOrder,
        isActive: true,
        createdAt: new Date(),
      },
    })
  }
  console.log(`✅ ${rewards.length} reward definitions created`)

  // 4. Create default payment methods
  const paymentMethods = [
    { name: 'USDT (BEP-20)', type: 'CRYPTO', details: { network: 'BEP-20', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' } }
  ]

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.create({
      data: {
        name: pm.name,
        type: pm.type,
        details: pm.details,
        isActive: true,
        createdAt: new Date(),
      },
    })
  }
  console.log(`✅ ${paymentMethods.length} payment methods created`)

  // 5. Create admin BusinessVolume record
  await prisma.businessVolume.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      updatedAt: new Date(),
    },
  })
  console.log('✅ Admin business volume record created')

  console.log('\n🎉 Seed complete! Admin login:')
  console.log('   Username: superadmin')
  console.log('   Password: Admin@2026')
  console.log('   Referral Code: NEXARISE')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
