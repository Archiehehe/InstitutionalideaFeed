export interface ParsedArticle {
  title: string
  author?: string
  cleanedText: string
  paywallStatus: 'unknown' | 'paywalled' | 'free'
  canonicalUrl?: string
  publishedAt?: string
}

export function parseArticleHtml(html: string, url: string): ParsedArticle {
  let title = extractTitle(html)
  if (!title) title = guessTitleFromUrl(url)

  const author = extractMeta(html, 'author')
  let publishedAt = extractMeta(html, 'article:published_time')
  if (!publishedAt) publishedAt = extractMeta(html, 'date')
  const canonicalUrl = extractCanonical(html)
  const paywallStatus = detectPaywall(html)
  const cleanedText = extractCleanText(html)

  return {
    title,
    author,
    cleanedText,
    paywallStatus,
    canonicalUrl,
    publishedAt,
  }
}

function extractTitle(html: string): string | undefined {
  const ogMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
  if (ogMatch) return decodeHtml(ogMatch[1])
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) return decodeHtml(titleMatch[1])
  return undefined
}

function extractMeta(html: string, name: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]+)"`, 'i'),
    new RegExp(`<meta[^>]+property="${name}"[^>]+content="([^"]+)"`, 'i'),
  ]
  for (const pattern of patterns) {
    const m = html.match(pattern)
    if (m) return decodeHtml(m[1])
  }
  return undefined
}

function extractCanonical(html: string): string | undefined {
  const m = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)
  return m ? m[1] : undefined
}

function detectPaywall(html: string): 'unknown' | 'paywalled' | 'free' {
  const paywallIndicators = [
    'paywall', 'subscribe to read', 'subscriber only', 'premium article',
    'subscribe now', 'this content is for subscribers',
  ]
  const lower = html.toLowerCase()
  for (const indicator of paywallIndicators) {
    if (lower.includes(indicator)) return 'paywalled'
  }
  return 'free'
}

function extractCleanText(html: string): string {
  // Strip scripts, styles, and nav
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')

  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, ' ')

  // Decode HTML entities
  text = decodeHtml(text)

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim()

  // Truncate to prevent absurdly long text
  return text.slice(0, 10000)
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
}

function guessTitleFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname
    const segments = path.split('/').filter(Boolean)
    const last = segments[segments.length - 1] || segments[segments.length - 2] || ''
    return last.replace(/[-_]/g, ' ').replace(/\.[a-z]+$/, '')
  } catch {
    return url
  }
}
