import type { MetricsProvider } from '../types'

export const secapiProvider: MetricsProvider = {
  name: 'secapi',
  async getSnapshot(ticker: string) {
    const key = process.env.SECAPI_KEY
    if (!key) return null

    try {
      const res = await fetch(`https://api.secapi.io/v1/company/${ticker}?apikey=${key}`)
      const data = await res.json()

      if (!data || data.error) return null

      return {
        valuationJson: {
          cik: data.cik,
          sic: data.sic,
          sicDescription: data.sicDescription,
          fiscalYearEnd: data.fiscalYearEnd,
          entityType: data.entityType,
        },
        rawJson: data,
      }
    } catch {
      return null
    }
  },
}
