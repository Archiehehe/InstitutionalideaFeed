import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'

export async function GET() {
  const store = getStore()
  const [sources, latestScans, articles] = await Promise.all([
    store.getSources(),
    store.getLatestSourceScanResults(),
    store.getArticles({ status: 'saved', limit: 2000 }),
  ])

  const scansBySourceId = new Map(latestScans.map((scan) => [scan.sourceId, scan]))
  const articleCounts = new Map<string, number>()
  for (const article of articles) {
    articleCounts.set(article.sourceId, (articleCounts.get(article.sourceId) ?? 0) + 1)
  }

  const enrichedSources = sources.map((source) => {
    const latestScan = scansBySourceId.get(source.id)
    return {
      ...source,
      lastScannedAt: latestScan?.finishedAt ?? latestScan?.startedAt,
      lastScanStatus: latestScan?.status,
      lastScanError: latestScan?.error,
      lastUrlsFound: latestScan?.urlsFound ?? 0,
      lastUrlsAttempted: latestScan?.urlsAttempted ?? 0,
      lastSavedCount: latestScan?.savedCount ?? 0,
      lastRejectedCount: latestScan?.rejectedCount ?? 0,
      lastFailedCount: latestScan?.failedCount ?? 0,
      qualifiedArticleCount: articleCounts.get(source.id) ?? 0,
    }
  })

  const enabledSources = sources.filter((source) => source.enabled)
  const latestScanRunId = latestScans
    .map((scan) => scan.scanRunId)
    .filter(Boolean)[0]
  const latestRunScans = latestScanRunId
    ? latestScans.filter((scan) => scan.scanRunId === latestScanRunId)
    : []

  return Response.json({
    summary: {
      totalSources: sources.length,
      enabledSources: enabledSources.length,
      enabledCoreSources: enabledSources.filter((source) => source.sourceTier === 'core').length,
      enabledMediaSources: enabledSources.filter((source) => isMediaSourceNameOrDomain(source.name, source.domain)).length,
      latestScanRunId,
      sourcesScannedInLastRun: latestRunScans.length,
      sourcesProducedQualifyingArticles: latestRunScans.filter((scan) => scan.savedCount > 0).length,
      sourcesProducedNoQualifyingArticles: latestRunScans.filter((scan) => scan.savedCount === 0 && scan.status !== 'failed').length,
      sourcesFailedInLastRun: latestRunScans.filter((scan) => scan.status === 'failed').length,
    },
    sources: enrichedSources,
  })
}

export async function POST(request: NextRequest) {
  const store = getStore()
  const body = await request.json()
  const source = await store.createSource(body)
  return Response.json(source, { status: 201 })
}

function isMediaSourceNameOrDomain(name: string, domain: string): boolean {
  const text = `${name} ${domain}`.toLowerCase()
  return [
    'cnbc', 'benzinga', 'seeking alpha', 'seekingalpha', 'yahoo finance',
    'marketwatch', 'reuters', 'investing.com', 'tipranks', 'the fly',
    'stockanalysis', 'marketbeat', 'streetinsider', 'gurufocus',
  ].some((blocked) => text.includes(blocked))
}
