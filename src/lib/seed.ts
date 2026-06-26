import { getStore } from './storage'
import type { Source } from './storage/types'

/* Demo data — clearly marked as seed/sample content */

export async function seedDemoData(): Promise<void> {
  const store = getStore()

  if (await store.isSeeded()) return

  const sources = await store.getSources()
  if (sources.length > 0) return

  // Sources
  const sourceData: Omit<Source, 'id' | 'createdAt' | 'updatedAt'>[] = [
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
  const createdSources: Source[] = []
  for (const src of sourceData) {
    const s = await store.createSource(src)
    createdSources.push(s)
  }

  // Demo article 1: BofA Fab Five Software
  const a1 = await store.createArticle({
    sourceId: createdSources[11].id,
    url: 'https://investing.com/bofa-fab-five-software-picks',
    canonicalUrl: undefined,
    title: 'BofA names its Fab Five software stocks to own — and three that could be at risk',
    author: 'Investing.com',
    publishedAt: '2026-06-20T10:00:00Z',
    fetchedAt: new Date().toISOString(),
    rawText: '',
    cleanedText: 'Bank of America has named its top five software stocks for the second half of 2026. The basket includes Snowflake (SNOW), Datadog (DDOG), MongoDB (MDB), JFrog (FROG), and Twilio (TWLO). These are the firms highest-conviction software names.',
    paywallStatus: 'free',
    articleScore: 14,
    status: 'saved',
  })
  await store.createExtraction({
    articleId: a1.id,
    firm: 'Bank of America',
    sourceType: 'media',
    category: 'Stock Basket',
    theme: 'Software',
    sector: 'Technology',
    region: 'US',
    summary: 'Bank of America has named its top five software stocks for the second half of 2026.',
    reasonShown: 'Published by Bank of America; Extracted 5 tickers; Contains basket/stock pick language; Theme: Software; Sector: Technology',
    extractedTickers: ['SNOW', 'DDOG', 'MDB', 'FROG', 'TWLO'],
    extractedCompanies: ['Snowflake', 'Datadog', 'MongoDB', 'JFrog', 'Twilio'],
    scoreBreakdown: {
      '3+ tickers/companies': 5,
      'Basket language detected': 4,
      'Known institution detected': 3,
      'Sector and region detected': 2,
      '5+ stocks detected': 2,
    },
    confidence: 90,
  })
  for (const t of ['SNOW', 'DDOG', 'MDB', 'FROG', 'TWLO']) {
    await store.createIdea({ articleId: a1.id, ticker: t, companyName: undefined, sector: 'Technology', theme: 'Software', confidence: 90, isInWatchlist: false, isInPortfolio: false })
  }

  // Demo article 2: Goldman Energy Basket
  const a2 = await store.createArticle({
    sourceId: createdSources[8].id,
    url: 'https://goldmansachs.com/energy-basket-2026',
    canonicalUrl: undefined,
    title: 'Goldman Sachs: Our top energy stock basket for H2 2026',
    author: 'Goldman Sachs Research',
    publishedAt: '2026-06-19T14:00:00Z',
    fetchedAt: new Date().toISOString(),
    rawText: '',
    cleanedText: 'Goldman Sachs has released its conviction energy basket for the second half of 2026. Top picks include DINO, COP, EQT, VNOM, FANG, KMI, LNG, GLNG, HAL, and VST. The firm expects strong relative performance from these names given the favorable commodity backdrop.',
    paywallStatus: 'free',
    articleScore: 16,
    status: 'saved',
  })
  await store.createExtraction({
    articleId: a2.id,
    firm: 'Goldman Sachs',
    sourceType: 'primary',
    category: 'Stock Basket',
    theme: 'Energy',
    sector: 'Energy',
    region: 'US',
    summary: 'Goldman Sachs has released its conviction energy basket for the second half of 2026.',
    reasonShown: 'Published by Goldman Sachs; Extracted 10 tickers; Contains basket/stock pick language; Theme: Energy; Sector: Energy; 5+ stocks detected',
    extractedTickers: ['DINO', 'COP', 'EQT', 'VNOM', 'FANG', 'KMI', 'LNG', 'GLNG', 'HAL', 'VST'],
    extractedCompanies: [],
    scoreBreakdown: {
      '3+ tickers/companies': 5,
      'Basket language detected': 4,
      'Known institution detected': 3,
      'Primary source': 3,
      'Sector and region detected': 2,
      '5+ stocks detected': 2,
      'Price targets/ratings mentioned': 2,
    },
    confidence: 95,
  })
  for (const t of ['DINO', 'COP', 'EQT', 'VNOM', 'FANG', 'KMI', 'LNG', 'GLNG', 'HAL', 'VST']) {
    await store.createIdea({ articleId: a2.id, ticker: t, sector: 'Energy', theme: 'Energy', confidence: 95, isInWatchlist: false, isInPortfolio: false })
  }

  // Demo article 3: BofA Private Credit Basket
  const a3 = await store.createArticle({
    sourceId: createdSources[11].id,
    url: 'https://bofa.com/private-credit-basket',
    canonicalUrl: undefined,
    title: 'BofA launches private credit basket covering top alternative asset managers',
    author: 'BofA Global Research',
    publishedAt: '2026-06-18T09:00:00Z',
    fetchedAt: new Date().toISOString(),
    rawText: '',
    cleanedText: 'Bank of America has created a new private credit basket featuring the leading alternative asset managers: ARES, KKR, OWL, and BX. The basket reflects growing institutional demand for private credit exposure.',
    paywallStatus: 'free',
    articleScore: 12,
    status: 'saved',
  })
  await store.createExtraction({
    articleId: a3.id,
    firm: 'Bank of America',
    sourceType: 'primary',
    category: 'Stock Basket',
    theme: 'Private Credit',
    sector: 'Financials',
    region: 'US',
    summary: 'Bank of America has created a new private credit basket featuring leading alternative asset managers.',
    reasonShown: 'Published by Bank of America; Extracted 4 tickers; Contains basket language; Theme: Private Credit; Sector: Financials',
    extractedTickers: ['ARES', 'KKR', 'OWL', 'BX'],
    extractedCompanies: ['ARES', 'KKR', 'OWL', 'BX'],
    scoreBreakdown: {
      '3+ tickers/companies': 5,
      'Basket language detected': 4,
      'Known institution detected': 3,
      'Primary source': 3,
      'Sector and region detected': 2,
    },
    confidence: 85,
  })
  for (const t of ['ARES', 'KKR', 'OWL', 'BX']) {
    await store.createIdea({ articleId: a3.id, ticker: t, sector: 'Financials', theme: 'Private Credit', confidence: 85, isInWatchlist: false, isInPortfolio: false })
  }

  // Demo article 4: JPMorgan China Consumer Beverage
  const a4 = await store.createArticle({
    sourceId: createdSources[10].id,
    url: 'https://jpmorgan.com/china-beverage-coverage',
    canonicalUrl: undefined,
    title: 'JPMorgan initiates coverage on China beverage stocks with overweight ratings',
    author: 'J.P. Morgan Research',
    publishedAt: '2026-06-17T11:00:00Z',
    fetchedAt: new Date().toISOString(),
    rawText: '',
    cleanedText: 'JPMorgan has initiated coverage on five China consumer beverage companies. The bank started Luckin Coffee, Mixue Group, Guming Holdings, Nongfu Spring, and Chagee with overweight ratings, citing strong domestic consumption trends.',
    paywallStatus: 'free',
    articleScore: 14,
    status: 'saved',
  })
  await store.createExtraction({
    articleId: a4.id,
    firm: 'JPMorgan',
    sourceType: 'primary',
    category: 'Coverage Initiation',
    theme: 'China Consumer',
    sector: 'Consumer',
    region: 'China',
    summary: 'JPMorgan has initiated coverage on five China consumer beverage companies.',
    reasonShown: 'Published by JPMorgan; Extracted tickers; Contains basket language; Theme: China Consumer; Sector: Consumer; Region: China; EM/country angle',
    extractedTickers: ['LKNCY'],
    extractedCompanies: ['Luckin Coffee', 'Mixue Group', 'Guming Holdings', 'Nongfu Spring', 'Chagee'],
    scoreBreakdown: {
      '3+ tickers/companies': 5,
      'Basket language detected': 4,
      'Known institution detected': 3,
      'Primary source': 3,
      'Sector and region detected': 2,
      'EM/country angle': 2,
      '5+ stocks detected': 2,
    },
    confidence: 92,
  })
  for (const name of ['Luckin Coffee', 'Mixue Group', 'Guming Holdings', 'Nongfu Spring', 'Chagee']) {
    await store.createIdea({ articleId: a4.id, ticker: name === 'Luckin Coffee' ? 'LKNCY' : name, companyName: name, sector: 'Consumer', theme: 'China Consumer', confidence: 92, isInWatchlist: false, isInPortfolio: false })
  }

  // Baskets
  const basket1 = await store.createBasket({
    name: 'BofA Fab Five Software | DEMO',
    articleId: a1.id,
    firm: 'Bank of America',
    theme: 'Software',
    sector: 'Technology',
    region: 'US',
    notes: 'Demo basket from BofA Fab Five Software article',
  })
  for (const t of ['SNOW', 'DDOG', 'MDB', 'FROG', 'TWLO']) {
    await store.addBasketMember({ basketId: basket1.id, ticker: t })
  }

  const basket2 = await store.createBasket({
    name: 'Goldman Energy Basket | DEMO',
    articleId: a2.id,
    firm: 'Goldman Sachs',
    theme: 'Energy',
    sector: 'Energy',
    region: 'US',
    notes: 'Demo basket from Goldman Sachs Energy article',
  })
  for (const t of ['DINO', 'COP', 'EQT', 'VNOM', 'FANG', 'KMI', 'LNG', 'GLNG', 'HAL', 'VST']) {
    await store.addBasketMember({ basketId: basket2.id, ticker: t })
  }

  const basket3 = await store.createBasket({
    name: 'BofA Private Credit Basket | DEMO',
    articleId: a3.id,
    firm: 'Bank of America',
    theme: 'Private Credit',
    sector: 'Financials',
    region: 'US',
    notes: 'Demo basket from BofA Private Credit article',
  })
  for (const t of ['ARES', 'KKR', 'OWL', 'BX']) {
    await store.addBasketMember({ basketId: basket3.id, ticker: t })
  }

  const basket4 = await store.createBasket({
    name: 'JPM China Consumer Beverage | DEMO',
    articleId: a4.id,
    firm: 'JPMorgan',
    theme: 'China Consumer',
    sector: 'Consumer',
    region: 'China',
    notes: 'Demo basket from JPMorgan China Beverage coverage initiation',
  })
  for (const item of [{ ticker: 'LKNCY', company: 'Luckin Coffee' }, { ticker: 'MIXUE', company: 'Mixue Group' }, { ticker: 'GUMING', company: 'Guming Holdings' }, { ticker: '9633.HK', company: 'Nongfu Spring' }, { ticker: 'CHAGEE', company: 'Chagee' }]) {
    await store.addBasketMember({ basketId: basket4.id, ticker: item.ticker, companyName: item.company })
  }

  // Watchlist items
  await store.addWatchlistItem({
    ticker: 'MDB', companyName: 'MongoDB', exchange: 'NASDAQ', country: 'US',
    sector: 'Technology', theme: 'Software', sourceArticleId: a1.id, sourceBasketId: basket1.id,
    notes: 'From BofA Fab Five basket',
  })
  await store.addWatchlistItem({
    ticker: 'FANG', companyName: 'Diamondback Energy', exchange: 'NASDAQ', country: 'US',
    sector: 'Energy', theme: 'Energy', sourceArticleId: a2.id, sourceBasketId: basket2.id,
    notes: 'From Goldman Energy basket',
  })
  await store.addWatchlistItem({
    ticker: 'ARES', companyName: 'Ares Management', exchange: 'NYSE', country: 'US',
    sector: 'Financials', theme: 'Private Credit', sourceArticleId: a3.id, sourceBasketId: basket3.id,
    notes: 'From BofA Private Credit basket',
  })

  // Metrics snapshot for SNOW
  await store.saveMetricsSnapshot({
    ticker: 'SNOW',
    provider: 'demo',
    snapshotDate: new Date().toISOString(),
    price: 145.20,
    marketCap: 45_000_000_000,
    analystRating: 'Outperform',
    avgPriceTarget: 175.00,
    impliedUpside: 20.5,
    athPrice: 185.00,
    distanceFromAth: 21.5,
    high52Week: 180.00,
    low52Week: 110.00,
    revenueGrowth: 0.28,
    valuationJson: {
      peRatio: 85,
      forwardPERatio: 55,
      evToRevenue: 18,
      grossMargin: 0.75,
    },
    earningsDate: '2026-08-20',
  })

  await store.markSeeded()
}
