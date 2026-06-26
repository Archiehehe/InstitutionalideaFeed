import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'

export async function GET() {
  const store = getStore()

  const baskets = await store.getBaskets()
  const result = []

  for (const basket of baskets) {
    const members = await store.getBasketMembers(basket.id)
    result.push({
      ...basket,
      tickers: members.map(m => m.ticker),
    })
  }

  return Response.json(result)
}

export async function POST(request: NextRequest) {
  const store = getStore()
  const body = await request.json()
  const basket = await store.createBasket({
    name: body.name,
    articleId: body.articleId,
    firm: body.firm,
    theme: body.theme,
    sector: body.sector,
    region: body.region,
    notes: body.notes,
  })

  if (body.tickers) {
    for (const t of body.tickers) {
      await store.addBasketMember({ basketId: basket.id, ticker: t })
    }
  }

  return Response.json(basket, { status: 201 })
}
