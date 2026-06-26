export const DEFAULT_THRESHOLD = 8

export interface ScoreInput {
  tickerCount: number
  companyCount: number
  hasBasketLanguage: boolean
  hasFirm: boolean
  sourceType: string
  sectorDetected: boolean
  regionDetected: boolean
  isEMRegion: boolean
  tickerSetSize: number
  hasPriceTargetLanguage: boolean
  isPaywalled: boolean
  isGenericMacro: boolean
  isLowQuality: boolean
  scoreBreakdown: Record<string, number>
}

export function isAboveThreshold(totalScore: number, threshold = DEFAULT_THRESHOLD): boolean {
  return totalScore >= threshold
}
