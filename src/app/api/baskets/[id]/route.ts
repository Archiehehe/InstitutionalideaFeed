import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const store = getStore()
  const { id } = await params
  await store.deleteBasket(id)
  return Response.json({ deleted: true })
}
