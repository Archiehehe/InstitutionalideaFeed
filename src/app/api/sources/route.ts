import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'

export async function GET() {
  const store = getStore()
  const sources = await store.getSources()
  return Response.json(sources)
}

export async function POST(request: NextRequest) {
  const store = getStore()
  const body = await request.json()
  const source = await store.createSource(body)
  return Response.json(source, { status: 201 })
}
