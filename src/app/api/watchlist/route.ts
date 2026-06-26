import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'
import { seedDemoData } from '@/lib/seed'

export async function GET() {
  const store = getStore()
  await seedDemoData()
  const items = await store.getWatchlist()
  return Response.json(items)
}

export async function POST(request: NextRequest) {
  const store = getStore()
  const { ticker, companyName, exchange, country, sector, theme, sourceArticleId, sourceBasketId, notes } = await request.json()

  if (!ticker) return Response.json({ error: 'ticker required' }, { status: 400 })

  const item = await store.addWatchlistItem({
    ticker: ticker.toUpperCase(),
    companyName,
    exchange,
    country,
    sector,
    theme,
    sourceArticleId,
    sourceBasketId,
    notes,
  })

  return Response.json(item, { status: 201 })
}
