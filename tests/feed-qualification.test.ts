import test from 'node:test'
import assert from 'node:assert/strict'

import { qualifyArticleForFeed } from '../src/lib/feedQualification'
import { validateListCandidate } from '../src/lib/sellSideLists/validateListCandidate'
import type { Source } from '../src/lib/storage/types'

const institutionalSource: Source = {
  id: 'source-1',
  name: 'Example Research',
  domain: 'example-research.com',
  sourceType: 'primary',
  sourceClass: 'primary_institutional',
  sourceTier: 'core',
  enabled: true,
  qualityScore: 10,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

test('accepts institutional research with 3+ tickers', () => {
  const result = qualifyArticleForFeed(
    {
      title: 'Technology outlook for 2024',
      url: 'https://example-research.com/tech-outlook',
      cleanedText: 'This research note covers NVDA, AMD, and AVGO with a detailed market outlook and sector discussion.',
    },
    { extractedTickers: ['NVDA', 'AMD', 'AVGO'], summary: 'Technology outlook with multiple stock ideas.', theme: 'technology', sector: 'Technology' },
    institutionalSource,
  )

  assert.equal(result.qualified, true)
  assert.equal(result.pageType, 'market_outlook')
  assert.deepEqual(result.screenableTickers, ['NVDA', 'AMD', 'AVGO'])
})

test('accepts 1 ticker when the article is clearly research-driven', () => {
  const result = qualifyArticleForFeed(
    {
      title: 'Microsoft strategy note',
      url: 'https://example-research.com/microsoft-strategy',
      cleanedText: 'This is a strong research note on Microsoft strategy, competitive positioning, and the company outlook for investors.',
    },
    { extractedTickers: ['MSFT'], summary: 'Research note about Microsoft strategy.', theme: 'technology', sector: 'Technology' },
    institutionalSource,
  )

  assert.equal(result.qualified, true)
  assert.equal(result.pageType, 'market_outlook')
  assert.deepEqual(result.screenableTickers, ['MSFT'])
})

test('accepts 0 ticker sector/theme research when the page is clearly outlook-driven', () => {
  const result = qualifyArticleForFeed(
    {
      title: 'Sector outlook for software and semis',
      url: 'https://example-research.com/sector-outlook',
      cleanedText: 'This sector outlook highlights software and semiconductor themes, cyclical positioning, and market exposure for investors.',
    },
    { extractedTickers: [], summary: 'Sector outlook with market and theme analysis.', theme: 'technology', sector: 'Technology' },
    institutionalSource,
  )

  assert.equal(result.qualified, true)
  assert.equal(result.pageType, 'sector_or_theme_research')
  assert.deepEqual(result.screenableTickers, [])
})

test('accepts manager commentary with no ticker when the content is investment-oriented', () => {
  const result = qualifyArticleForFeed(
    {
      title: 'Portfolio commentary and market outlook',
      url: 'https://example-research.com/commentary',
      cleanedText: 'The manager outlines investment implications, market outlook, and where we see opportunity for clients.',
    },
    { extractedTickers: [], summary: 'Manager commentary and market outlook.', theme: 'macro', sector: 'Macro' },
    institutionalSource,
  )

  assert.equal(result.qualified, true)
  assert.equal(result.pageType, 'manager_commentary')
})

test('rejects fund and product marketing pages', () => {
  const result = qualifyArticleForFeed(
    {
      title: 'Our funds',
      url: 'https://example-research.com/funds/abc',
      cleanedText: 'A fund fact sheet describing product details and performance.',
    },
    { extractedTickers: [], summary: 'Fund marketing page.', theme: 'funds', sector: 'Funds' },
    institutionalSource,
  )

  assert.equal(result.qualified, false)
  assert.equal(result.rejectionCategory, 'rejected_fund_or_etf_page')
})

test('rejects media summary sources', () => {
  const result = qualifyArticleForFeed(
    {
      title: 'BofA stock picks',
      url: 'https://news.example.com/bofa-stock-picks',
      cleanedText: 'A summary of BofA stock picks with multiple company mentions and no original research.',
    },
    { extractedTickers: ['AAPL', 'MSFT'], summary: 'Media summary of bank lists.', theme: 'news', sector: 'News' },
    { ...institutionalSource, name: 'Bloomberg', domain: 'bloomberg.com', sourceClass: 'public_institutional_research' },
  )

  assert.equal(result.qualified, false)
  assert.equal(result.rejectionCategory, 'rejected_media_source_not_allowed')
})

test('rejects short pages with insufficient text', () => {
  const result = qualifyArticleForFeed(
    {
      title: 'Short page',
      url: 'https://example-research.com/short-page',
      cleanedText: 'Short.',
    },
    { extractedTickers: [], summary: 'Too short.', theme: 'macro', sector: 'Macro' },
    institutionalSource,
  )

  assert.equal(result.qualified, false)
})

test('keeps list-feed validation at 3+ tickers', () => {
  const result = validateListCandidate({
    institution: 'Example',
    listName: 'Example',
    displayName: 'Example Example',
    sourceType: 'manual',
    confidence: 'needs_review',
    reviewStatus: 'needs_review',
    members: [{ ticker: 'AAPL' }, { ticker: 'MSFT' }],
  })

  assert.equal(result.valid, false)
  assert.match(result.errors.join(' '), /3\+ tickers required/)
})
