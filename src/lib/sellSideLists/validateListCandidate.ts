import type { SellSideListCandidate } from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateListCandidate(candidate: SellSideListCandidate): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!candidate.institution || !candidate.institution.trim()) {
    errors.push('Institution is required.')
  }

  if (!candidate.listName || !candidate.listName.trim()) {
    errors.push('List name is required.')
  }

  if (!['manual', 'csv', 'paste'].includes(candidate.sourceType) && !candidate.sourceUrl?.trim()) {
    errors.push('Source URL is required unless source type is manual, paste, or csv.')
  }

  if (candidate.sourceType === 'media_summary' && candidate.reviewStatus !== 'needs_review') {
    errors.push('Media summaries must remain needs_review.')
  }

  const tickerSet = new Set(candidate.members.map((member) => member.ticker.toUpperCase()))
  if (tickerSet.size !== candidate.members.length) {
    warnings.push('Duplicate tickers found and deduplicated.')
  }

  if (tickerSet.size < 3) {
    errors.push('3+ tickers required.')
  }

  if (candidate.theme === undefined && candidate.sector === undefined) {
    warnings.push('No theme or sector specified.')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
