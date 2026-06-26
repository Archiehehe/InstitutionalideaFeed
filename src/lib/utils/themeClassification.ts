const THEME_KEYWORDS: Record<string, string[]> = {
  'AI / Cloud': ['ai', 'artificial intelligence', 'cloud', 'machine learning', 'llm', 'gpt', 'data center', 'datacenter'],
  'Software': ['software', 'saas', 'enterprise', 'cloud computing'],
  'Energy': ['energy', 'oil', 'gas', 'lng', 'renewable', 'solar', 'wind'],
  'Private Credit': ['private credit', 'direct lending', 'credit fund'],
  'China Consumer': ['china consumer', 'china beverage', 'chinese consumer', 'china retail'],
  'Consumer / Beverages': ['consumer', 'beverage', 'retail', 'restaurant', 'e-commerce'],
  'Defense': ['defense', 'aerospace', 'military', 'defence'],
  'Healthcare': ['healthcare', 'biotech', 'pharma', 'medtech', 'glp-1'],
  'Financials': ['financial', 'bank', 'insurance', 'fintech'],
  'Real Estate': ['real estate', 'reit', 'property'],
  'Technology': ['tech', 'technology', 'semiconductor', 'cyber'],
  'Telecom': ['telecom', 'telecommunications', '5g'],
  'Utilities': ['utilities', 'electric', 'power'],
  'Materials': ['materials', 'mining', 'commodity', 'steel'],
}

const SECTOR_KEYWORDS: Record<string, string[]> = {
  'Technology': ['technology', 'tech', 'software', 'saas', 'cloud', 'ai', 'semiconductor'],
  'Healthcare': ['healthcare', 'biotech', 'pharma', 'medtech'],
  'Financials': ['financial', 'bank', 'insurance', 'credit', 'fintech'],
  'Energy': ['energy', 'oil', 'gas', 'lng', 'renewable'],
  'Consumer': ['consumer', 'retail', 'beverage', 'restaurant', 'e-commerce'],
  'Industrials': ['industrial', 'manufacturing', 'defense', 'aerospace'],
  'Materials': ['materials', 'mining', 'commodity'],
  'Real Estate': ['real estate', 'reit', 'property'],
  'Utilities': ['utilities', 'electric', 'power'],
  'Communication': ['media', 'telecom', 'entertainment', 'communication'],
}

const REGION_KEYWORDS: Record<string, string[]> = {
  'US': ['united states', 'us market', 's&p 500', 'nasdaq', 'nyse', 'american'],
  'Europe': ['europe', 'eurozone', 'european', 'eu'],
  'China': ['china', 'chinese', 'hong kong', 'shanghai', 'shenzhen'],
  'India': ['india', 'indian', 'nifty', 'bse', 'nse'],
  'Japan': ['japan', 'japanese', 'nikkei', 'tse'],
  'Korea': ['korea', 'korean', 'kospi'],
  'Brazil': ['brazil', 'brazilian', 'bovespa'],
  'EM': ['emerging market', 'emerging', 'em market'],
  'Global': ['global', 'worldwide', 'international'],
}

export function classifyTheme(text: string): string {
  const lower = text.toLowerCase()
  let bestTheme = 'General'
  let bestScore = 0
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        const score = kw.length
        if (score > bestScore) {
          bestScore = score
          bestTheme = theme
        }
      }
    }
  }
  return bestTheme
}

export function classifySector(text: string): string {
  const lower = text.toLowerCase()
  let bestSector = 'Unknown'
  let bestScore = 0
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        const score = kw.length
        if (score > bestScore) {
          bestScore = score
          bestSector = sector
        }
      }
    }
  }
  return bestSector
}

export function classifyRegion(text: string): string {
  const lower = text.toLowerCase()
  let bestRegion = 'Unknown'
  let bestScore = 0
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        const score = kw.length
        if (score > bestScore) {
          bestScore = score
          bestRegion = region
        }
      }
    }
  }
  return bestRegion
}
