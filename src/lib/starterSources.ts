import type { Source } from '@/lib/storage/types'

/**
 * Real starter source definitions for the scanner.
 * No fake articles, baskets, watchlist items, or metrics.
 * Only source definitions — users import these to populate their source list.
 */
export const STARTER_SOURCES: Omit<Source, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Investing.com', domain: 'investing.com', sourceType: 'media', rssUrl: 'https://www.investing.com/rss/news.rss', parserType: 'generic', enabled: true, qualityScore: 7 },
  { name: 'MarketBeat', domain: 'marketbeat.com', sourceType: 'media', rssUrl: 'https://www.marketbeat.com/rss/', parserType: 'marketbeat', enabled: true, qualityScore: 8 },
  { name: 'StreetInsider', domain: 'streetinsider.com', sourceType: 'media', rssUrl: 'https://www.streetinsider.com/rss/feed.xml', parserType: 'generic', enabled: true, qualityScore: 7 },
  { name: 'Yahoo Finance', domain: 'finance.yahoo.com', sourceType: 'media', rssUrl: 'https://finance.yahoo.com/news/rssindex', parserType: 'generic', enabled: true, qualityScore: 6 },
  { name: 'GuruFocus', domain: 'gurufocus.com', sourceType: 'media', rssUrl: 'https://www.gurufocus.com/rss/', parserType: 'gurufocus', enabled: true, qualityScore: 7 },
  { name: 'CNBC', domain: 'cnbc.com', sourceType: 'media', rssUrl: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', parserType: 'generic', enabled: true, qualityScore: 6 },
  { name: 'Benzinga', domain: 'benzinga.com', sourceType: 'media', rssUrl: 'https://www.benzinga.com/feed', parserType: 'generic', enabled: true, qualityScore: 7 },
  { name: 'The Fly', domain: 'thefly.com', sourceType: 'media', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 8 },
  { name: 'Goldman Sachs Insights', domain: 'goldmansachs.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 9 },
  { name: 'Morgan Stanley Insights', domain: 'morganstanley.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 9 },
  { name: 'J.P. Morgan Research', domain: 'jpmorgan.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 9 },
  { name: 'BofA Research', domain: 'bofa.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 9 },
  { name: 'UBS CIO', domain: 'ubs.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 9 },
  { name: 'BlackRock Investment Institute', domain: 'blackrock.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 9 },
  { name: 'Citi Research', domain: 'citigroup.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 9 },
  { name: 'PIMCO', domain: 'pimco.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 8 },
  { name: 'Fidelity', domain: 'fidelity.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 8 },
  { name: 'T. Rowe Price', domain: 'troweprice.com', sourceType: 'primary', rssUrl: undefined, parserType: 'generic', enabled: true, qualityScore: 8 },
  { name: 'TipRanks', domain: 'tipranks.com', sourceType: 'media', rssUrl: 'https://www.tipranks.com/rss/news', parserType: 'tipranks', enabled: true, qualityScore: 8 },
  { name: 'Seeking Alpha', domain: 'seekingalpha.com', sourceType: 'media', rssUrl: 'https://seekingalpha.com/feed.xml', parserType: 'generic', enabled: true, qualityScore: 7 },
]
