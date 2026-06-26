import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const store = getStore()
  const { id } = await params
  const members = await store.getBasketMembers(id)
  const tickers = members.map(m => m.ticker)

  // Run metrics triggered — actual run happens via the metrics API
  return Response.json({
    basketId: id,
    tickers,
    status: 'metrics_queued',
  })
}
