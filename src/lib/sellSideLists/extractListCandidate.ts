import type { SellSideListCandidate, SellSideListMember } from './types'
import { normalizeTicker, isScreenableEquityTicker } from '@/lib/utils/screenableTicker'

const KNOWN_TICKERS: Record<string, { ticker: string; companyName: string }> = {
  SNOW: { ticker: 'SNOW', companyName: 'Snowflake' },
  DDOG: { ticker: 'DDOG', companyName: 'Datadog' },
  FROG: { ticker: 'FROG', companyName: 'JFrog' },
  MDB: { ticker: 'MDB', companyName: 'MongoDB' },
  TWLO: { ticker: 'TWLO', companyName: 'Twilio' },
}

export function parsePastedList(text: string): Partial<SellSideListCandidate> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const header = lines[0] ?? ''
  const tickerLines = lines.slice(1)

  const institution = guessInstitution(header)
  const listName = guessListName(header, institution)
  const period = guessPeriod(header)
  const year = guessYear(header)
  const members: SellSideListMember[] = []

  for (const line of tickerLines) {
    const parsed = parseTickerLine(line)
    if (parsed) members.push(parsed)
  }

  return {
    institution,
    listName,
    displayName: `${institution} ${listName}`.trim(),
    period: period ?? undefined,
    year,
    members,
    sourceType: 'paste',
    confidence: 'needs_review',
  }
}

export function parseCandidateFromText(text: string, context: Partial<SellSideListCandidate> = {}): Partial<SellSideListCandidate> {
  const candidate = parsePastedList(text)
  const members = candidate.members && candidate.members.length > 0
    ? candidate.members
    : parseKnownTickerMentions(text)

  const institution = context.institution?.trim() || candidate.institution || 'Unknown Institution'
  const listName = context.listName?.trim() || candidate.listName || 'Untitled List'
  const displayName = [institution, listName].filter(Boolean).join(' ').trim()

  return {
    institution,
    listName,
    displayName,
    period: context.period ?? candidate.period ?? undefined,
    year: context.year ?? candidate.year ?? undefined,
    theme: context.theme ?? undefined,
    sector: context.sector ?? undefined,
    region: context.region ?? undefined,
    sourcePublisher: context.sourcePublisher ?? undefined,
    sourceUrl: context.sourceUrl ?? undefined,
    sourceType: context.sourceType ?? 'media_summary',
    confidence: context.confidence ?? 'needs_review',
    reviewStatus: context.reviewStatus ?? 'needs_review',
    rawSourceTitle: context.rawSourceTitle ?? undefined,
    rawSourceExcerpt: context.rawSourceExcerpt ?? undefined,
    members: members.map((member, index) => ({ ...member, rank: member.rank ?? index + 1 })),
  }
}

function guessInstitution(header: string): string {
  const known = [
    'BofA', 'Bank of America', 'Morgan Stanley', 'Goldman Sachs',
    'JPMorgan', 'J.P. Morgan', 'UBS', 'Citi', 'Jefferies',
    'Barclays', 'Evercore', 'Piper Sandler', 'BTIG',
    'Oppenheimer', 'Mizuho', 'Bernstein', 'Raymond James',
    'RBC', 'Wells Fargo', 'Deutsche Bank',
  ]
  for (const name of known) {
    if (header.toLowerCase().includes(name.toLowerCase())) return name
  }
  return 'Unknown Institution'
}

function guessListName(header: string, institution: string): string {
  let remainder = header
  if (institution !== 'Unknown Institution') {
    remainder = header.replace(new RegExp(institution, 'i'), '').trim()
  }
  return remainder.replace(/\s+/g, ' ').trim() || 'Untitled List'
}

function guessPeriod(header: string): string | null {
  const periodMatch = header.match(/\b(H[12]|Q[1-4])\b/i)
  return periodMatch ? periodMatch[1].toUpperCase() : null
}

function guessYear(header: string): number | undefined {
  const yearMatch = header.match(/\b(20\d{2})\b/)
  return yearMatch ? parseInt(yearMatch[1], 10) : undefined
}

function parseTickerLine(line: string): SellSideListMember | null {
  const cleaned = line.replace(/^[-*\d.]+\)?\s*/, '').trim()
  const parts = cleaned.split(/\s+-\s+/)
  let ticker = parts[0]?.trim().toUpperCase() ?? ''
  let companyName: string | undefined

  if (parts.length > 1 && parts[1]) {
    companyName = parts.slice(1).join(' - ').trim()
  }

  const actionMatch = ticker.match(/\(([^)]+)\)$/)
  let action: SellSideListMember['action'] = 'unknown'
  if (actionMatch) {
    const a = actionMatch[1].toLowerCase()
    if (a.includes('buy') || a.includes('overweight')) action = 'buy'
    else if (a.includes('sell') || a.includes('underweight')) action = 'sell'
    else if (a.includes('underperform')) action = 'underperform'
    ticker = ticker.replace(/\([^)]+\)$/, '').trim()
  }

  ticker = normalizeTicker(ticker)
  if (!ticker || !isScreenableEquityTicker(ticker)) return null

  return { ticker, companyName, action }
}

function parseKnownTickerMentions(text: string): SellSideListMember[] {
  const normalized = text.toUpperCase()
  const matches = Object.values(KNOWN_TICKERS).filter((entry) => normalized.includes(entry.ticker))
  return matches.map((entry) => ({ ticker: entry.ticker, companyName: entry.companyName, action: 'buy' }))
}
