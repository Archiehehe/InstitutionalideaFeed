import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const store = getStore()
  const { id } = await params
  const body = await request.json()
  const source = await store.updateSource(id, body)
  if (!source) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(source)
}
