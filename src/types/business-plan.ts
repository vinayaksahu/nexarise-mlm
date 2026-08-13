export interface AchievementRewardItem {
  name: string
  volumeRequired: number
  rewardAmount: number
  isActive?: boolean
}

export interface BusinessConfig {
  minInvestment: number
  maxInvestment: number
  investmentMultiple: number
  currency: string
  dailyRoiPercentage: number
  roiDurationDays: number
  totalRoiPercentage: number
  levelIncomePercentages: number[]
  levelQualifications?: string[]
  maxLevels: number
  achievementRewards?: AchievementRewardItem[]
  p2pFeePercentage: number
  minP2pTransfer: number
  withdrawalFeePercentage: number
  minWithdrawal: number
  maxWithdrawalPerDay: number
  maxDirectReferralsForIncome: number
  requireDirectReferralsForLevelIncome: boolean
  minDirectReferralsForLevel: number[]
  requireSelfInvestmentForLevelIncome?: boolean
  requiredSelfInvestmentForLevel?: number[]
  showP2pFee?: boolean
  showWithdrawalFee?: boolean
  depositAddress?: string
  depositQrUrl?: string
}

export const defaultAchievementRewards: AchievementRewardItem[] = [
  { name: 'Star', volumeRequired: 1000, rewardAmount: 25, isActive: true },
  { name: 'Bronze', volumeRequired: 5000, rewardAmount: 125, isActive: true },
  { name: 'Silver', volumeRequired: 10000, rewardAmount: 250, isActive: true },
  { name: 'Gold', volumeRequired: 25000, rewardAmount: 625, isActive: true },
  { name: 'Platinum', volumeRequired: 50000, rewardAmount: 1250, isActive: true },
  { name: 'Diamond', volumeRequired: 100000, rewardAmount: 2500, isActive: true },
  { name: 'Blue Diamond', volumeRequired: 250000, rewardAmount: 6250, isActive: true },
  { name: 'Black Diamond', volumeRequired: 500000, rewardAmount: 12500, isActive: true },
  { name: 'Crown', volumeRequired: 1000000, rewardAmount: 25000, isActive: true },
  { name: 'Crown Ambassador', volumeRequired: 5000000, rewardAmount: 100000, isActive: true },
]

export function formatDirectReferrals(num: number): string {
  if (num <= 0) return '0 Direct Referrals'
  return `${num} Direct Referral${num === 1 ? '' : 's'}`
}

export function getDefaultQualifications(count: number): string[] {
  const result: string[] = []
  for (let i = 1; i <= count; i++) {
    result.push(formatDirectReferrals(i))
  }
  return result
}
