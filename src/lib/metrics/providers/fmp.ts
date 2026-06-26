import type { MetricsProvider } from '../types'

export const fmpProvider: MetricsProvider = {
  name: 'fmp',
  async getSnapshot(ticker: string) {
    const key = process.env.FMP_API_KEY
    if (!key) return null

    try {
      const [profileRes, quoteRes] = await Promise.all([
        fetch(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${key}`),
        fetch(`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${key}`),
      ])

      const [profile, quote] = await Promise.all([profileRes.json(), quoteRes.json()])

      if (!Array.isArray(profile) || profile.length === 0) return null

      const p = profile[0]
      const q = Array.isArray(quote) && quote.length > 0 ? quote[0] : {}

      return {
        price: q.price ?? p.price,
        marketCap: p.mktCap,
        revenueGrowth: q.revenueGrowth,
        valuationJson: {
          peRatio: q.pe,
          forwardPERatio: p.forwardPE,
          pegRatio: p.pegRatio,
          evToEbitda: p.evToEbitda,
          evToRevenue: p.evToRevenue,
          profitMargin: p.profitMargin,
          grossMargin: p.grossProfitMargin,
          operatingMargin: p.operatingMargin,
          debtToEquity: p.debtToEquity,
          returnOnEquity: p.returnOnEquity,
          returnOnAssets: p.returnOnAssets,
          priceToBook: p.priceToBook,
        },
        athPrice: p.athPrice,
        distanceFromAth: p.athPrice && q.price ? ((p.athPrice - q.price) / p.athPrice) * 100 : undefined,
        high52Week: q.yearHigh,
        low52Week: q.yearLow,
        earningsDate: p.lastEarningsDate ?? q.earningsDate,
        rawJson: { profile: p, quote: q },
      }
    } catch {
      return null
    }
  },
}
