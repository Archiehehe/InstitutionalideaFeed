import type { MetricsProvider } from '../types'

export const twelveDataProvider: MetricsProvider = {
  name: 'twelve',
  async getSnapshot(ticker: string) {
    const key = process.env.TWELVE_DATA_API_KEY
    if (!key) return null

    try {
      const res = await fetch(
        `https://api.twelvedata.com/quote?symbol=${ticker}&apikey=${key}`,
      )
      const data = await res.json()

      if (!data || data.status === 'error') return null

      const price = parseFloat(data.close) || parseFloat(data.previous_close)
      const high52 = data.fifty_two_week?.high ? parseFloat(data.fifty_two_week.high) : undefined
      const low52 = data.fifty_two_week?.low ? parseFloat(data.fifty_two_week.low) : undefined
      const ath = high52
      const distanceFromAth = ath && price ? ((ath - price) / ath) * 100 : undefined

      return {
        price,
        marketCap: data.market_capitalization ? parseFloat(data.market_capitalization) : undefined,
        high52Week: high52,
        low52Week: low52,
        athPrice: ath,
        distanceFromAth,
        valuationJson: {
          peRatio: data.pe_ratio ? parseFloat(data.pe_ratio) : undefined,
          eps: data.eps ? parseFloat(data.eps) : undefined,
          dividendYield: data.dividend_yield ? parseFloat(data.dividend_yield) : undefined,
        },
        rawJson: data,
      }
    } catch {
      return null
    }
  },
}
