import { runScan } from '@/lib/ingestion/runScan'
import { handleApiError } from '@/lib/api/responses'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret) {
      return Response.json({ error: 'CRON_SECRET not configured on server.' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await runScan()
    return Response.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
