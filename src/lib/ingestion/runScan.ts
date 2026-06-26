import { getStore } from '@/lib/storage'
import { getEnabledSources } from './sources'
import { fetchUrlsFromSource, fetchArticleHtml } from './fetcher'
import { parseArticleHtml } from './parser'
import { extractFromArticle } from './extractor'
import { isAboveThreshold } from './scorer'
import { generateDuplicateKey, isDuplicate } from './dedupe'

export interface ScanResult {
  scanRunId: string
  sourcesChecked: number
  urlsFound: number
  articlesParsed: number
  articlesSaved: number
  errors: string[]
}

export async function runScan(): Promise<ScanResult> {
  const store = getStore()
  const errors: string[] = []

  const scanRun = await store.createScanRun({
    startedAt: new Date().toISOString(),
    status: 'running',
    sourcesChecked: 0,
    urlsFound: 0,
    articlesParsed: 0,
    articlesSaved: 0,
  })

  let totalUrls = 0
  let totalParsed = 0
  let totalSaved = 0

  try {
    const sources = await getEnabledSources()

    for (const source of sources) {
      try {
        const urls = await fetchUrlsFromSource(source)
        totalUrls += urls.length

        for (const fetched of urls) {
          try {
            const dupKey = generateDuplicateKey(fetched.url, fetched.title || '')
            if (await isDuplicate(dupKey)) continue

            let html: string
            try {
              html = await fetchArticleHtml(fetched.url)
            } catch {
              continue
            }

            totalParsed++
            const parsed = parseArticleHtml(html, fetched.url)
            const extraction = extractFromArticle(
              parsed.title,
              parsed.cleanedText,
              source.sourceType,
            )
            const totalScore = Object.values(extraction.scoreBreakdown).reduce((a, b) => a + b, 0)

            if (!isAboveThreshold(totalScore)) continue

            const article = await store.createArticle({
              sourceId: source.id,
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
              firm: extraction.firm,
              sourceType: extraction.sourceType,
              category: extraction.category,
              theme: extraction.theme,
              sector: extraction.sector,
              region: extraction.region,
              summary: parsed.cleanedText.slice(0, 500),
              reasonShown: extraction.reasonShown,
              extractedTickers: extraction.extractedTickers,
              extractedCompanies: extraction.extractedCompanies,
              scoreBreakdown: extraction.scoreBreakdown,
              confidence: extraction.confidence,
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

            totalSaved++
          } catch (err) {
            errors.push(`Error processing ${fetched.url}: ${err instanceof Error ? err.message : String(err)}`)
          }
        }
      } catch (err) {
        errors.push(`Error with source ${source.name}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  } catch (err) {
    errors.push(`Scan error: ${err instanceof Error ? err.message : String(err)}`)
  }

  await store.updateScanRun(scanRun.id, {
    finishedAt: new Date().toISOString(),
    status: errors.length > 0 ? 'failed' : 'completed',
    sourcesChecked: (await store.getSources()).length,
    urlsFound: totalUrls,
    articlesParsed: totalParsed,
    articlesSaved: totalSaved,
    errorsJson: errors.length > 0 ? { errors } : undefined,
  })

  return {
    scanRunId: scanRun.id,
    sourcesChecked: (await store.getSources()).length,
    urlsFound: totalUrls,
    articlesParsed: totalParsed,
    articlesSaved: totalSaved,
    errors,
  }
}
