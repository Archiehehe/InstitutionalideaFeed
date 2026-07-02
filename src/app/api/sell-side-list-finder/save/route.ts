import { saveListCandidate } from '@/lib/sellSideLists'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const candidate = await request.json()
  const result = await saveListCandidate(candidate)
  return NextResponse.json({
    success: result.success,
    created: result.created,
    updated: result.updated,
    skipped: result.skipped,
    failed: result.failed,
    errors: result.errors,
    warnings: result.warnings,
    convictionListId: result.listId,
    url: result.url,
    status: result.status,
  })
}
