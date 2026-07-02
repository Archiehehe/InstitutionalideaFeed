import { parseCandidateFromText } from '@/lib/sellSideLists'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const text = typeof body?.text === 'string' ? body.text : ''
  const preview = parseCandidateFromText(text, {
    institution: body?.institution,
    listName: body?.listName,
    year: body?.year ? Number(body.year) : undefined,
    period: body?.period,
    theme: body?.theme,
    sector: body?.sector,
    region: body?.region,
    sourcePublisher: body?.sourcePublisher,
    sourceUrl: body?.sourceUrl,
    sourceType: body?.sourceType,
    confidence: body?.confidence,
    reviewStatus: body?.reviewStatus ?? 'needs_review',
    rawSourceTitle: body?.rawSourceTitle,
    rawSourceExcerpt: body?.rawSourceExcerpt,
  })
  return NextResponse.json({ preview })
}
