import type { MetricsProvider } from '../types'

export const alphaVantageProvider: MetricsProvider = {
  name: 'alpha_vantage',
  async getSnapshot(ticker: string) {
    const key = process.env.ALPHA_VANTAGE_API_KEY
    if (!key) return null

    try {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${key}`,
      )
      const data = await res.json()

      if (!data || data.Note || data.Information) return null

      return {
        price: undefined,
        marketCap: data.MarketCapitalization ? parseFloat(data.MarketCapitalization) : undefined,
        revenueGrowth: data.RevenueGrowthTTM ? parseFloat(data.RevenueGrowthTTM) : undefined,
        valuationJson: {
          peRatio: data.PERatio ? parseFloat(data.PERatio) : undefined,
          pegRatio: data.PEGRatio ? parseFloat(data.PEGRatio) : undefined,
          forwardPE: data.ForwardPE ? parseFloat(data.ForwardPE) : undefined,
          priceToBook: data.PriceToBookRatio ? parseFloat(data.PriceToBookRatio) : undefined,
          evToEbitda: data.EVToEBITDA ? parseFloat(data.EVToEBITDA) : undefined,
          profitMargin: data.ProfitMargin ? parseFloat(data.ProfitMargin) : undefined,
          grossMargin: data.GrossProfitTTM ? undefined : undefined,
          dividendYield: data.DividendYield ? parseFloat(data.DividendYield) : undefined,
          eps: data.EPS ? parseFloat(data.EPS) : undefined,
          beta: data.Beta ? parseFloat(data.Beta) : undefined,
          sector: data.Sector,
          industry: data.Industry,
        },
        earningsDate: data.LastEarningsDate,
        rawJson: data,
      }
    } catch {
      return null
    }
  },
}
