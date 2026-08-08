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
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getBusinessConfig(): Promise<BusinessConfig> {
  if (cachedConfig && Date.now() - cachedConfig.fetchedAt < CACHE_TTL) {
    return cachedConfig.config
  }
  const plan = await db.businessPlanVersion.findFirst({
    where: { isActive: true },
    orderBy: { version: 'desc' },
  })
  if (!plan) throw new Error('No active business plan found')
  const config = plan.config as unknown as BusinessConfig
  cachedConfig = { config, fetchedAt: Date.now() }
  return config
}

export function invalidateConfigCache() {
  cachedConfig = null
}
