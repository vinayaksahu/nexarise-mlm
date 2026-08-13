export interface AchievementRewardItem {
  name: string
  volumeRequired: number
  rewardAmount: number
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
  showP2pFee?: boolean
  showWithdrawalFee?: boolean
  depositAddress?: string
  depositQrUrl?: string
}

export const defaultAchievementRewards: AchievementRewardItem[] = [
  { name: 'Star', volumeRequired: 1000, rewardAmount: 25 },
  { name: 'Bronze', volumeRequired: 5000, rewardAmount: 125 },
  { name: 'Silver', volumeRequired: 10000, rewardAmount: 250 },
  { name: 'Gold', volumeRequired: 25000, rewardAmount: 625 },
  { name: 'Platinum', volumeRequired: 50000, rewardAmount: 1250 },
  { name: 'Diamond', volumeRequired: 100000, rewardAmount: 2500 },
  { name: 'Blue Diamond', volumeRequired: 250000, rewardAmount: 6250 },
  { name: 'Black Diamond', volumeRequired: 500000, rewardAmount: 12500 },
  { name: 'Crown', volumeRequired: 1000000, rewardAmount: 25000 },
  { name: 'Crown Ambassador', volumeRequired: 5000000, rewardAmount: 100000 },
]

export function getDefaultQualifications(count: number): string[] {
  const result: string[] = []
  for (let i = 1; i <= count; i++) {
    result.push(`${i} Direct Referral${i === 1 ? '' : 's'}`)
  }
  return result
}
