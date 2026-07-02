import { qualifyArticleForFeed } from '../src/lib/feedQualification'
import type { Source } from '../src/lib/storage/types'

const institutionalSource: Source = {
  id: 'source-smoke',
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

const cases = [
  {
    name: 'institutional article with 3 tickers',
    article: {
      title: 'Technology outlook',
      url: 'https://example-research.com/tech-outlook',
      cleanedText: 'This note covers NVDA, AMD, and AVGO with a clear market outlook and sector analysis.',
    },
    extraction: { extractedTickers: ['NVDA', 'AMD', 'AVGO'], summary: 'Outlook', theme: 'technology', sector: 'Technology' },
    expected: true,
  },
  {
    name: 'fund product page',
    article: {
      title: 'Our funds',
      url: 'https://example-research.com/funds/abc',
      cleanedText: 'A fund fact sheet with performance and holdings.',
    },
    extraction: { extractedTickers: [], summary: 'Fund page', theme: 'funds', sector: 'Funds' },
    expected: false,
  },
]

for (const testCase of cases) {
  const result = qualifyArticleForFeed(testCase.article, testCase.extraction, institutionalSource)
  if (result.qualified !== testCase.expected) {
    console.error(`Smoke case failed: ${testCase.name}`)
    process.exit(1)
  }
}

console.log('Feed smoke checks passed')