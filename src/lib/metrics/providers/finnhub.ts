import type { MetricsProvider } from '../types'

export const finnhubProvider: MetricsProvider = {
  name: 'finnhub',
  async getSnapshot(ticker: string) {
    const key = process.env.FINNHUB_API_KEY
    if (!key) return null

    try {
      const [quoteRes, profileRes, targetRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${key}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${key}`),
        fetch(`https://finnhub.io/api/v1/stock/price-target?symbol=${ticker}&token=${key}`),
      ])

      const [quote, profile, target] = await Promise.all([
        quoteRes.json(), profileRes.json(), targetRes.json(),
      ])

      if (!quote || !quote.c) return null

      const price = quote.c
      const high52 = quote.h
      const low52 = quote.l
      const ath = high52
      const distanceFromAth = ath && price ? ((ath - price) / ath) * 100 : undefined

      return {
        price,
        marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1_000_000 : undefined,
        analystRating: target.targetHigh && target.targetLow ? 'Mixed' : undefined,
        avgPriceTarget: target.targetMedian || target.targetMean,
        impliedUpside: (target.targetMedian && price) ? ((target.targetMedian - price) / price) * 100 : undefined,
        athPrice: ath,
        distanceFromAth,
        high52Week: high52,
        low52Week: low52,
        valuationJson: {
          exchange: profile.exchange,
          industry: profile.finnhubIndustry,
          ipoDate: profile.ipo,
          shareOutstanding: profile.shareOutstanding,
        },
        earningsDate: undefined,
        rawJson: { quote, profile, target },
      }
    } catch {
      return null
    }
  },
}
