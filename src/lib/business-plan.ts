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
  depositAddress?: string
  depositQrUrl?: string
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
      config.minInvestment = Number(config.minInvestment ?? 5)
      config.maxInvestment = Number(config.maxInvestment ?? 1000)
      config.investmentMultiple = Number(config.investmentMultiple ?? 1)
      config.p2pFeePercentage = 0
      config.showP2pFee = false
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
    levelIncomePercentages: [30, 20, 10, 5, 5, 5, 5, 2.5, 2.5, 2.5, 2.5],
    maxLevels: 11,
    p2pFeePercentage: 0,
    minP2pTransfer: 1,
    withdrawalFeePercentage: 5,
    minWithdrawal: 5,
    maxWithdrawalPerDay: 5000,
    maxDirectReferralsForIncome: 11,
    requireDirectReferralsForLevelIncome: false,
    minDirectReferralsForLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
