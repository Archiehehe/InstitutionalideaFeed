import { NextRequest } from 'next/server'
import { getStore } from '@/lib/storage'
import { extractFromArticle } from '@/lib/ingestion/extractor'
import { parseArticleHtml } from '@/lib/ingestion/parser'
import { fetchArticleHtml } from '@/lib/ingestion/fetcher'
import { generateDuplicateKey } from '@/lib/ingestion/dedupe'
import { DEFAULT_THRESHOLD } from '@/lib/ingestion/scorer'

export async function GET(request: NextRequest) {
  const store = getStore()

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search')?.toLowerCase()
  const firm = searchParams.get('firm')
  const sector = searchParams.get('sector')
  const region = searchParams.get('region')

  const articles = await store.getArticles({ minScore: DEFAULT_THRESHOLD })

  const result = []
  for (const article of articles) {
    const extraction = await store.getExtraction(article.id)
    const source = await store.getSource(article.sourceId)

    if (firm && extraction?.firm !== firm) continue
    if (sector && extraction?.sector !== sector) continue
    if (region && extraction?.region !== region) continue
    if (search) {
      const match = article.title.toLowerCase().includes(search) ||
        (extraction?.reasonShown?.toLowerCase().includes(search) ?? false)
      if (!match) continue
    }

    result.push({
      id: article.id,
      title: article.title,
      sourceName: source?.name ?? 'Unknown',
      sourceType: extraction?.sourceType ?? source?.sourceType ?? 'unknown',
      firm: extraction?.firm,
      publishedAt: article.publishedAt,
      theme: extraction?.theme,
      sector: extraction?.sector,
      region: extraction?.region,
      tickers: extraction?.extractedTickers ?? [],
      score: article.articleScore,
      reasonShown: extraction?.reasonShown,
    })
  }

  return Response.json(result)
}

export async function POST(request: NextRequest) {
  const store = getStore()

  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'URL required' }, { status: 400 })
    }

    const existing = await store.getArticleByUrl(url)
    if (existing) {
      return Response.json({ error: 'Article already exists' }, { status: 409 })
    }

    const html = await fetchArticleHtml(url)
    const parsed = parseArticleHtml(html, url)

    const extraction = extractFromArticle(parsed.title, parsed.cleanedText, 'manual')
    const totalScore = Object.values(extraction.scoreBreakdown).reduce((a, b) => a + b, 0)

    if (totalScore < DEFAULT_THRESHOLD) {
      return Response.json({
        error: 'Article score too low',
        score: totalScore,
        breakdown: extraction.scoreBreakdown,
      }, { status: 422 })
    }

    const dupKey = generateDuplicateKey(url, parsed.title)
    const article = await store.createArticle({
      sourceId: 'manual',
      url,
      canonicalUrl: parsed.canonicalUrl,
      title: parsed.title,
      author: parsed.author,
      publishedAt: parsed.publishedAt || new Date().toISOString(),
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

    for (const ticker of extraction.extractedTickers) {
      await store.createIdea({
        articleId: article.id,
        ticker,
        sector: extraction.sector,
        theme: extraction.theme,
        confidence: extraction.confidence,
        isInWatchlist: false,
        isInPortfolio: false,
      })
    }

    return Response.json({ id: article.id, score: totalScore }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Failed to process' }, { status: 500 })
  }
}
