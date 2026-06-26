import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'

export async function POST(request: NextRequest) {
  const store = getStore()
  const { articleId, action, notes } = await request.json()

  if (!articleId || !action) {
    return Response.json({ error: 'articleId and action required' }, { status: 400 })
  }

  const feedback = await store.createFeedback({ articleId, action, notes })
  return Response.json(feedback, { status: 201 })
}
