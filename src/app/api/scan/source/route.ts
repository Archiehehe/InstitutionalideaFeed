import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'
import { fetchUrlsFromSource, fetchArticleHtml } from '@/lib/ingestion/fetcher'
import { parseArticleHtml } from '@/lib/ingestion/parser'
import { extractFromArticle } from '@/lib/ingestion/extractor'
import { generateDuplicateKey, isDuplicate } from '@/lib/ingestion/dedupe'
import { DEFAULT_THRESHOLD } from '@/lib/ingestion/scorer'

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '')

  if (cronSecret && authHeader !== cronSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const store = getStore()
  const { sourceId } = await request.json()

  if (!sourceId) {
    return Response.json({ error: 'sourceId required' }, { status: 400 })
  }

  const source = await store.getSource(sourceId)
  if (!source) {
    return Response.json({ error: 'Source not found' }, { status: 404 })
  }

  const urls = await fetchUrlsFromSource(source)
  const results = []

  for (const fetched of urls) {
    try {
      const dupKey = generateDuplicateKey(fetched.url, fetched.title || '')
      if (await isDuplicate(dupKey)) {
        results.push({ url: fetched.url, status: 'duplicate' })
        continue
      }

      const html = await fetchArticleHtml(fetched.url)
      const parsed = parseArticleHtml(html, fetched.url)
      const extraction = extractFromArticle(parsed.title, parsed.cleanedText, source.sourceType)
      const totalScore = Object.values(extraction.scoreBreakdown).reduce((a, b) => a + b, 0)

      if (totalScore < DEFAULT_THRESHOLD) {
        results.push({ url: fetched.url, status: 'low_score', score: totalScore })
        continue
      }

      const article = await store.createArticle({
        sourceId,
        url: fetched.url,
        canonicalUrl: parsed.canonicalUrl,
        title: parsed.title,
        author: parsed.author,
        publishedAt: parsed.publishedAt || fetched.publishedAt || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        rawText: html.slice(0, 50000),
        cleanedText: parsed.cleanedText,
        paywallStatus: parsed.paywallStatus,
        duplicateKey: dupKey,
        articleScore: totalScore,
        status: 'saved',
      })

      await store.createExtraction({
        articleId: article.id,
        ...extraction,
      })

      results.push({ url: fetched.url, status: 'saved', score: totalScore })
    } catch (err) {
      results.push({ url: fetched.url, status: 'error', error: String(err) })
    }
  }

  return Response.json({ source: source.name, urlsFound: urls.length, results })
}
