import { db } from './db'

export interface BusinessConfig {
  minInvestment: number
  maxInvestment: number
  investmentMultiple: number
  currency: string
  dailyRoiPercentage: number
  roiDurationDays: number
  totalRoiPercentage: number
  levelIncomePercentages: number[]
  maxLevels: number
  p2pFeePercentage: number
  minP2pTransfer: number
  withdrawalFeePercentage: number
  minWithdrawal: number
  maxWithdrawalPerDay: number
  maxDirectReferralsForIncome: number
  requireDirectReferralsForLevelIncome: boolean
  minDirectReferralsForLevel: number[]
  showP2pFee?: boolean
  showWithdrawalFee?: boolean
}

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
      cachedConfig = { config, fetchedAt: Date.now() }
      return config
    }
  } catch (e) {
    console.error('Config fetch error:', e)
  }

  // Safe fallback config
  const defaultConfig: BusinessConfig = {
    minInvestment: 5,
    maxInvestment: 10000,
    investmentMultiple: 5,
    currency: 'USDT',
    dailyRoiPercentage: 1,
    roiDurationDays: 200,
    totalRoiPercentage: 200,
    levelIncomePercentages: [5, 3, 2, 1, 1],
    maxLevels: 5,
    p2pFeePercentage: 2,
    minP2pTransfer: 1,
    withdrawalFeePercentage: 5,
    minWithdrawal: 5,
    maxWithdrawalPerDay: 5000,
    maxDirectReferralsForIncome: 5,
    requireDirectReferralsForLevelIncome: false,
    minDirectReferralsForLevel: [0, 0, 0, 0, 0],
    showP2pFee: true,
    showWithdrawalFee: true,
  }

  return defaultConfig
}

export function invalidateConfigCache() {
  cachedConfig = null
}
