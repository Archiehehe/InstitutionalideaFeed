import { NextRequest } from 'next/server'
import { runScan } from '@/lib/ingestion/runScan'

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '')

  if (cronSecret && authHeader !== cronSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runScan()
  return Response.json(result)
}
