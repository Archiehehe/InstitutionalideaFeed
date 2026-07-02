import type { Article, ArticleExtraction, PageType, RejectionCategory, Source } from '@/lib/storage/types'
import type { ExtractionResult } from '@/lib/ingestion/extractor'
import { getValidatedScreenableTickers, isScreenableEquityTicker } from '@/lib/utils/screenableTicker'
import { MEDIA_DOMAINS, MEDIA_SOURCE_PATTERNS } from '@/lib/safety/disallowedDomains'


export type FeedQualificationArticle = Pick<Article, 'title' | 'url'> & {
  cleanedText?: string
}

export type FeedQualificationExtraction = Pick<
  ArticleExtraction | ExtractionResult,
  'extractedTickers' | 'summary' | 'theme' | 'sector'
>

export interface FeedQualificationResult {
  qualified: boolean
  reason: string
  pageType: PageType
  screenableTickers: string[]
  rejectionCategory?: RejectionCategory
}

export const ELIGIBLE_FEED_PAGE_TYPES: PageType[] = [
  'institutional_research_idea',
  'market_outlook',
  'sector_or_theme_research',
  'stock_basket_research',
  'manager_commentary',
]

const RESEARCH_FEED_SCORE_THRESHOLDS = {
  withTicker: 7,
  tickerless: 8,
} as const

const SCORE_WEIGHTS = {
  dedicatedParser: 4,
  institutionalSource: 3,
  eligibleArticleType: 3,
  multiTicker: 3,
  singleTicker: 2,
  researchTerms: 2,
  substantialText: 2,
  recentArticle: 1,
  authorDate: 1,
  sourceInsightPath: 1,
  productPage: 6,
  landingPage: 5,
  mediaSummary: 5,
  littleText: 4,
  macroOnly: 3,
  duplicate: 3,
  noDateNoEvergreen: 2,
} as const

const TITLE_REJECT_RULES: Array<{ pattern: RegExp; pageType: PageType; rejectionCategory: RejectionCategory }> = [
  { pattern: /^(insights|insights\s*&\s*news|investment management insights\s*&\s*research|overheard at apollo)$/i, pageType: 'category_landing_page', rejectionCategory: 'rejected_category_landing_page' },
  { pattern: /\b(compare|comparison tool|calculator|screener|fund comparison)\b/i, pageType: 'tool_page', rejectionCategory: 'rejected_tool_page' },
  { pattern: /\b(etfs?\s+vs\.?\s+mutual funds?|etf basics|mutual funds?|funds?|smas?|commingled funds?|prospectus|fact sheet|performance|brochure|holdings|fund literature)\b/i, pageType: 'fund_or_etf_page', rejectionCategory: 'rejected_fund_or_etf_page' },
  { pattern: /\b(what is|how to|guide|learn|education|investing basics|glossary|retirement|account|fees|forms)\b/i, pageType: 'education_page', rejectionCategory: 'rejected_education_page' },
  { pattern: /\b(esg investing|responsible investing|sustainable investing overview)\b/i, pageType: 'generic_marketing_page', rejectionCategory: 'rejected_generic_marketing_page' },
  { pattern: /\b(product|solutions|strategies|institutional solutions|advisor resources|client resources|sell-side list|conviction list)\b/i, pageType: 'product_page', rejectionCategory: 'rejected_product_page' },
]

const URL_REJECT_RULES: Array<{ pattern: RegExp; pageType: PageType; rejectionCategory: RejectionCategory }> = [
  { pattern: /\/(insights|insights-news|insights-news\/insights|insights-news\/insights\/overheard-at-apollo)\/?$/i, pageType: 'category_landing_page', rejectionCategory: 'rejected_category_landing_page' },
  { pattern: /\/(education|learn|how-to|investing-basics|glossary)(\/|$)/i, pageType: 'education_page', rejectionCategory: 'rejected_education_page' },
  { pattern: /\/(tools?|calculator|compare|comparison)(\/|$)/i, pageType: 'tool_page', rejectionCategory: 'rejected_tool_page' },
  { pattern: /\/(funds?|etfs?|mutual-funds|products?|solutions|strategies|resources|advisor-resources|client-resources)(\/|$)/i, pageType: 'product_page', rejectionCategory: 'rejected_product_page' },
  { pattern: /\/(careers|contact|login|terms|privacy|authors|tag|category|search|sitemap|sitemap\.xml)(\/|$)/i, pageType: 'category_landing_page', rejectionCategory: 'rejected_category_landing_page' },
  { pattern: /\/(fact-sheet|prospectus|holdings|performance|brochure|fund-literature|product-page|sell-side-list|conviction-list)(\/|$)/i, pageType: 'fund_or_etf_page', rejectionCategory: 'rejected_fund_or_etf_page' },
  { pattern: /\/(esg-investing)(\/|$)/i, pageType: 'generic_marketing_page', rejectionCategory: 'rejected_generic_marketing_page' },
]

const RESEARCH_QUALIFIER_PATTERN = /\b(outlook|market outlook|investment outlook|weekly market commentary|monthly market commentary|strategy|strategist|research|insights|investment views|asset allocation|sector outlook|theme|thematic|portfolio positioning|market update|macro update|equity strategy|credit outlook|private markets outlook|risk outlook|investment implications|where we see opportunity|opportunities|top themes|best ideas|conviction|stocks|companies|beneficiaries|benefit from|exposure to)\b/i

const PAGE_TYPE_RULES: Array<{ pageType: PageType; pattern: RegExp }> = [
  { pageType: 'stock_basket_research', pattern: /\b(top picks|best ideas|conviction|stock picks|focus list|model list|sector picks|favorite stocks|stocks to buy|beneficiaries|companies)\b/i },
  { pageType: 'manager_commentary', pattern: /\b(commentary|memo|letter|investment views|where we see opportunity|investment implications)\b/i },
  { pageType: 'sector_or_theme_research', pattern: /\b(sector outlook|sector themes?|themes?|thematic|top themes|equity strategy|credit outlook|private markets outlook|risk outlook|exposure to|benefit from)\b/i },
  { pageType: 'market_outlook', pattern: /\b(market outlook|investment outlook|outlook|weekly market commentary|monthly market commentary|market update|macro update|asset allocation|portfolio positioning)\b/i },
  { pageType: 'institutional_research_idea', pattern: /\b(research|insights|strategy|strategist|opportunities|stocks|companies)\b/i },
]

export function qualifyArticleForFeed(
  article: FeedQualificationArticle,
  extraction: FeedQualificationExtraction | null | undefined,
  source?: Source | null,
): FeedQualificationResult {
  if (isMediaSource(source)) {
    return rejected('unknown', 'rejected_media_source_not_allowed', [])
  }

  const sourceClass = source?.sourceClass ?? 'primary_institutional'
  if (!['primary_institutional', 'public_institutional_research', 'manual'].includes(sourceClass)) {
    return rejected('unknown', 'rejected_media_source_not_allowed', [])
  }

  const screenableTickers = getScreenableTickers(extraction, source, article)
  const pageType = classifyPageType(article)
  const hardReject = getHardReject(article)
  if (hardReject) {
    return rejected(hardReject.pageType, hardReject.rejectionCategory, screenableTickers)
  }

  if (!source?.enabled || !isEligibleSourceClass(source)) {
    return rejected(pageType, 'rejected_media_source_not_allowed', screenableTickers)
  }

  if (!hasMatchingSourceDomain(article, source)) {
    return rejected(pageType, 'rejected_not_research_idea', screenableTickers)
  }

  if (!hasMeaningfulArticleText(article, extraction)) {
    return rejected(pageType, 'rejected_not_research_idea', screenableTickers)
  }

  const evidence = researchEvidenceText(article, extraction)
  if (!RESEARCH_QUALIFIER_PATTERN.test(evidence)) {
    return rejected(pageType, 'rejected_not_research_idea', screenableTickers)
  }

  if (!ELIGIBLE_FEED_PAGE_TYPES.includes(pageType)) {
    return rejected(pageType, rejectionForPageType(pageType), screenableTickers)
  }

  const score = scoreResearchFeedArticle({
    article,
    extraction,
    source,
    pageType,
    screenableTickers,
  })

  const threshold = screenableTickers.length > 0
    ? RESEARCH_FEED_SCORE_THRESHOLDS.withTicker
    : RESEARCH_FEED_SCORE_THRESHOLDS.tickerless

  if (score < threshold) {
    return rejected(pageType, 'rejected_not_research_idea', screenableTickers)
  }

  return {
    qualified: true,
    reason: buildReason(pageType, screenableTickers.length, source),
    pageType,
    screenableTickers,
  }
}

export function classifyPageType(article: FeedQualificationArticle): PageType {
  const hardReject = getHardReject(article)
  if (hardReject) return hardReject.pageType

  const text = researchEvidenceText(article, null)
  for (const rule of PAGE_TYPE_RULES) {
    if (rule.pattern.test(text)) return rule.pageType
  }
  return 'unknown'
}

export function isMediaSource(source?: Source | null): boolean {
  if (!source) return false
  const name = source.name.toLowerCase()
  const domain = source.domain.toLowerCase()
  return (
    Array.from(MEDIA_DOMAINS).some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`)) ||
    MEDIA_SOURCE_PATTERNS.some((blocked) => name.includes(blocked))
  )
}

export function getScreenableTickers(
  extraction: FeedQualificationExtraction | null | undefined,
  source?: Source | null,
  article?: FeedQualificationArticle,
): string[] {
  const evidenceText = researchEvidenceText(article ?? { title: '', url: '' }, extraction)
  return getValidatedScreenableTickers(extraction?.extractedTickers ?? [], evidenceText, source)
}

export { isScreenableEquityTicker }

function getHardReject(article: FeedQualificationArticle) {
  const title = article.title ?? ''
  const url = article.url ?? ''
  const path = safePath(url)

  for (const rule of TITLE_REJECT_RULES) {
    if (rule.pattern.test(title)) return rule
  }
  for (const rule of URL_REJECT_RULES) {
    if (rule.pattern.test(path)) return rule
  }
  return null
}

function isEligibleSourceClass(source?: Source | null): boolean {
  const sourceClass = source?.sourceClass ?? 'primary_institutional'
  return ['primary_institutional', 'public_institutional_research', 'manual'].includes(sourceClass)
}

function hasMatchingSourceDomain(article: FeedQualificationArticle, source?: Source | null): boolean {
  if (!source?.domain) return true

  try {
    const host = new URL(article.url ?? '').hostname.toLowerCase()
    const domain = source.domain.toLowerCase()
    return host === domain || host.endsWith(`.${domain}`)
  } catch {
    return true
  }
}

function hasMeaningfulArticleText(
  article: FeedQualificationArticle,
  extraction: FeedQualificationExtraction | null | undefined,
): boolean {
  const normalized = [article.title, extraction?.summary, article.cleanedText]
    .filter((part): part is string => Boolean(part?.toString().trim()))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized.length >= 80 && /\w/.test(normalized)
}

function researchEvidenceText(
  article: FeedQualificationArticle,
  extraction: FeedQualificationExtraction | null | undefined,
): string {
  return [
    article.title,
    article.url,
    extraction?.summary,
    article.cleanedText?.slice(0, 1200),
  ].filter(Boolean).join(' ')
}

function safePath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

function rejectionForPageType(pageType: PageType): RejectionCategory {
  switch (pageType) {
    case 'education_page':
      return 'rejected_education_page'
    case 'product_page':
      return 'rejected_product_page'
    case 'tool_page':
      return 'rejected_tool_page'
    case 'fund_or_etf_page':
      return 'rejected_fund_or_etf_page'
    case 'category_landing_page':
      return 'rejected_category_landing_page'
    case 'generic_marketing_page':
      return 'rejected_generic_marketing_page'
    default:
      return 'rejected_not_research_idea'
  }
}

function rejected(
  pageType: PageType,
  rejectionCategory: RejectionCategory,
  screenableTickers: string[],
): FeedQualificationResult {
  return {
    qualified: false,
    reason: rejectionCategory,
    pageType,
    screenableTickers,
    rejectionCategory,
  }
}

function buildReason(pageType: PageType, tickerCount: number, source?: Source | null): string {
  const sourceName = source?.name?.replace(/\s+Insights$/i, '') ?? 'this source'
  if (pageType === 'market_outlook') {
    return `Market outlook from ${sourceName} with ${tickerCount} screenable equity names.`
  }

  const tier = source?.sourceTier ?? 'institutional'
  return `${tickerCount} screenable tickers extracted from a ${tier} institutional research source.`
}

export interface FeedScoreInput {
  hasDedicatedParser: boolean
  pageType: PageType
  tickerCount: number
  title: string
  publishedAt?: string
  hasBasketLanguage: boolean
  extractionSummary?: string
  cleanedText?: string
}

function scoreResearchFeedArticle(input: {
  article: FeedQualificationArticle
  extraction: FeedQualificationExtraction | null | undefined
  source?: Source | null
  pageType: PageType
  screenableTickers: string[]
}): number {
  let score = 0
  const text = researchEvidenceText(input.article, input.extraction)

  if (input.source?.enabled) score += SCORE_WEIGHTS.institutionalSource
  if (input.source?.parserKey) score += SCORE_WEIGHTS.dedicatedParser
  if (ELIGIBLE_FEED_PAGE_TYPES.includes(input.pageType)) score += SCORE_WEIGHTS.eligibleArticleType
  if (input.screenableTickers.length >= 3) score += SCORE_WEIGHTS.multiTicker
  else if (input.screenableTickers.length >= 1) score += SCORE_WEIGHTS.singleTicker
  if (/\b(equity|stock|sector|theme|outlook|research|strategy|insights|market|commentary|opportunity|investment|portfolio|company)\b/i.test(text)) score += SCORE_WEIGHTS.researchTerms
  if (input.article.cleanedText && input.article.cleanedText.length >= 400) score += SCORE_WEIGHTS.substantialText
  if (input.article.url && /\b(insight|research|commentary|outlook|strategy)\b/i.test(input.article.url)) score += SCORE_WEIGHTS.sourceInsightPath

  if (input.article.cleanedText && input.article.cleanedText.length < 80) score -= SCORE_WEIGHTS.littleText
  if (/\b(fund|etf|product|prospectus|fact sheet|brochure|holdings|performance|literature)\b/i.test(text)) score -= SCORE_WEIGHTS.productPage
  if (/\b(sitemap|search|category|tag|author|landing|homepage|index)\b/i.test(text)) score -= SCORE_WEIGHTS.landingPage
  if (isMediaSource(input.source)) score -= SCORE_WEIGHTS.mediaSummary
  if (/\b(macro|economy|gdp|inflation|interest rate|central bank)\b/i.test(text) && !/\b(stock|equity|sector|company|theme|outlook)\b/i.test(text)) score -= SCORE_WEIGHTS.macroOnly
  if (input.article.cleanedText && input.article.cleanedText.length < 80) score -= SCORE_WEIGHTS.littleText

  return score
}

export function scoreFeedArticle(input: FeedScoreInput): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {}
  let score = 0

  if (input.hasDedicatedParser) { score += 3; breakdown.hasDedicatedParser = 3 }
  if (input.pageType === 'stock_basket_research') { score += 3; breakdown.pageTypeBasket = 3 }
  else if (input.pageType === 'sector_or_theme_research') { score += 2; breakdown.pageTypeSectorTheme = 2 }
  if (input.hasBasketLanguage) { score += 2; breakdown.basketLanguage = 2 }
  if (input.tickerCount >= 5) { score += 2; breakdown.tickerCountHigh = 2 }
  else if (input.tickerCount >= 3) { score += 1; breakdown.tickerCountMid = 1 }

  const text = [input.title, input.extractionSummary, input.cleanedText?.slice(0, 500)].filter(Boolean).join(' ')

  if (input.publishedAt) {
    const daysAgo = (Date.now() - new Date(input.publishedAt).getTime()) / 86400000
    if (daysAgo <= 7) { score += 1; breakdown.recent7d = 1 }
  }

  if (/\b(equity|stock|sector|theme|outlook)\b/i.test(text)) { score += 1; breakdown.titleEquityTerms = 1 }

  if (/\b(macro|economy|gdp|inflation|interest rate|central bank)\b/i.test(text) && !/\b(stock|equity|sector|company)\b/i.test(text)) {
    score -= 3; breakdown.macroOnly = -3
  }

  const poorTextPattern = /^\s*(404|error|not found|access denied|redirecting)\s*$/i
  if (poorTextPattern.test(text) || (input.cleanedText && input.cleanedText.length < 100)) {
    score -= 5; breakdown.poorText = -5
  }

  return { score, breakdown }
}
