import { NextRequest } from 'next/server'
import { runMetricsForTicker } from '@/lib/metrics/runMetrics'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params
  const result = await runMetricsForTicker(ticker)
  if (!result) return Response.json({ error: 'No data' }, { status: 404 })
  return Response.json(result)
}
