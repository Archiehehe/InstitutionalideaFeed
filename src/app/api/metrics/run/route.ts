import { NextRequest } from 'next/server'
import { runMetricsForTicker, runMetricsForTickers } from '@/lib/metrics/runMetrics'

export async function POST(request: NextRequest) {
  const { ticker, tickers } = await request.json()

  if (tickers && Array.isArray(tickers)) {
    const results = await runMetricsForTickers(tickers)
    const output: Record<string, unknown> = {}
    for (const [t, m] of results) output[t] = m
    return Response.json(output)
  }

  if (ticker) {
    const result = await runMetricsForTicker(ticker, true)
    return Response.json(result)
  }

  return Response.json({ error: 'ticker or tickers required' }, { status: 400 })
}
