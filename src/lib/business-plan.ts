import { db } from './db'
import {
  BusinessConfig,
  AchievementRewardItem,
  defaultAchievementRewards,
  getDefaultQualifications
} from '@/types/business-plan'

export * from '@/types/business-plan'

let cachedConfig: { config: BusinessConfig; fetchedAt: number } | null = null
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

export async function getBusinessConfig(): Promise<BusinessConfig> {
  if (cachedConfig && Date.now() - cachedConfig.fetchedAt < CACHE_TTL) {
    return cachedConfig.config
  }
  try {
    const plan = await db.businessPlanVersion.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    })
    if (plan) {
      const config = plan.config as unknown as BusinessConfig
      config.minInvestment = Number(config.minInvestment ?? 5)
      config.maxInvestment = Number(config.maxInvestment ?? 1000)
      config.investmentMultiple = Number(config.investmentMultiple ?? 1)
      config.p2pFeePercentage = 0
      config.showP2pFee = false
      const count = config.levelIncomePercentages?.length || 11
      if (!config.minDirectReferralsForLevel || !Array.isArray(config.minDirectReferralsForLevel)) {
        config.minDirectReferralsForLevel = Array.from({ length: count }, (_, i) => i + 1)
      }
      if (!config.requiredSelfInvestmentForLevel || !Array.isArray(config.requiredSelfInvestmentForLevel)) {
        config.requiredSelfInvestmentForLevel = Array.from({ length: count }, () => 0)
      }
      if (typeof config.requireSelfInvestmentForLevelIncome !== 'boolean') {
        config.requireSelfInvestmentForLevelIncome = false
      }
      if (!config.levelQualifications || !Array.isArray(config.levelQualifications) || config.levelQualifications.length === 0) {
        config.levelQualifications = getDefaultQualifications(count)
      }
      if (!config.achievementRewards || !Array.isArray(config.achievementRewards) || config.achievementRewards.length === 0) {
        config.achievementRewards = defaultAchievementRewards
      } else {
        config.achievementRewards = config.achievementRewards.map((r) => ({
          ...r,
          isActive: r.isActive !== false,
        }))
      }
      if (!config.depositAddress) {
        config.depositAddress = '0x1234567890abcdef1234567890abcdef12345678'
      }
      if (!config.depositQrUrl) {
        config.depositQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(config.depositAddress)}`
      }
      cachedConfig = { config, fetchedAt: Date.now() }
      return config
    }
  } catch (e) {
    console.error('Config fetch error:', e)
  }

  // Safe fallback config
  const defaultConfig: BusinessConfig = {
    minInvestment: 5,
    maxInvestment: 1000,
    investmentMultiple: 1,
    currency: 'USDT',
    dailyRoiPercentage: 1,
    roiDurationDays: 200,
    totalRoiPercentage: 200,
    levelIncomePercentages: [10, 3, 2, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5],
    minDirectReferralsForLevel: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    requireSelfInvestmentForLevelIncome: false,
    requiredSelfInvestmentForLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    levelQualifications: getDefaultQualifications(11),
    maxLevels: 11,
    achievementRewards: defaultAchievementRewards,
    p2pFeePercentage: 0,
    minP2pTransfer: 1,
    withdrawalFeePercentage: 5,
    minWithdrawal: 5,
    maxWithdrawalPerDay: 5000,
    maxDirectReferralsForIncome: 11,
    requireDirectReferralsForLevelIncome: false,
    showP2pFee: false,
    showWithdrawalFee: true,
    depositAddress: '0x1234567890abcdef1234567890abcdef12345678',
    depositQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x1234567890abcdef1234567890abcdef12345678',
  }

  return defaultConfig
}

export function invalidateConfigCache() {
  cachedConfig = null
}
