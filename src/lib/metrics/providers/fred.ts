import type { MetricsProvider } from '../types'

export const fredProvider: MetricsProvider = {
  name: 'fred',
  async getSnapshot(_ticker: string) {
    void _ticker // unused; FRED returns macro context
    const key = process.env.FRED_API_KEY
    if (!key) return null

    try {
      const res = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=SP500&api_key=${key}&file_type=json&sort_order=desc&limit=1`,
      )
      const data = await res.json()

      if (!data || data.error_code) return null

      return {
        valuationJson: {
          sp500: data.observations?.[0]?.value,
          macroSource: 'FRED',
        },
        rawJson: data,
      }
    } catch {
      return null
    }
  },
}
