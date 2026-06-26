import type { Source } from '@/lib/storage/types'

interface FetchedUrl {
  url: string
  sourceId: string
  publishedAt?: string
  title?: string
}

export async function fetchUrlsFromSource(source: Source): Promise<FetchedUrl[]> {
  const urls: FetchedUrl[] = []

  if (source.rssUrl) {
    try {
      const rssUrls = await fetchRss(source.rssUrl, source.id)
      urls.push(...rssUrls)
    } catch (err) {
      console.error(`Failed to fetch RSS for ${source.name}:`, err)
    }
  }

  if (source.sitemapUrl) {
    try {
      const sitemapUrls = await fetchSitemap(source.sitemapUrl, source.id)
      urls.push(...sitemapUrls)
    } catch (err) {
      console.error(`Failed to fetch sitemap for ${source.name}:`, err)
    }
  }

  return urls
}

export async function fetchRss(rssUrl: string, sourceId: string): Promise<FetchedUrl[]> {
  const response = await fetch(rssUrl, {
    headers: { 'User-Agent': 'InstitutionalIdeaFeed/1.0' },
  })
  const text = await response.text()

  const urls: FetchedUrl[] = []
  const linkRegex = /<link[^>]*>(.*?)<\/link>/gi
  const titleRegex = /<title[^>]*>(.*?)<\/title>/gi
  const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/gi

  const links: string[] = []
  let m
  while ((m = linkRegex.exec(text)) !== null) {
    const link = m[1].trim()
    if (link.startsWith('http')) links.push(link)
  }

  const titles: string[] = []
  while ((m = titleRegex.exec(text)) !== null) {
    titles.push(m[1].trim())
  }

  const dates: string[] = []
  while ((m = pubDateRegex.exec(text)) !== null) {
    dates.push(m[1].trim())
  }

  for (let i = 0; i < links.length; i++) {
    urls.push({
      url: links[i],
      sourceId,
      title: titles[i + 1] || titles[i] || undefined,
      publishedAt: dates[i] || undefined,
    })
  }

  return urls
}

export async function fetchSitemap(sitemapUrl: string, sourceId: string): Promise<FetchedUrl[]> {
  const response = await fetch(sitemapUrl, {
    headers: { 'User-Agent': 'InstitutionalIdeaFeed/1.0' },
  })
  const text = await response.text()

  const urls: FetchedUrl[] = []
  const locRegex = /<loc>(.*?)<\/loc>/gi
  let m
  while ((m = locRegex.exec(text)) !== null) {
    urls.push({ url: m[1].trim(), sourceId })
  }

  return urls
}

export async function fetchArticleHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'InstitutionalIdeaFeed/1.0' },
  })
  return response.text()
}
