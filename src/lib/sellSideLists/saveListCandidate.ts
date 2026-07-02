import type { SellSideListCandidate } from './types'
import { getStore } from '@/lib/storage'
import { validateListCandidate } from './validateListCandidate'

export interface SaveResult {
  success: boolean
  listId?: string
  url?: string
  created: number
  updated: number
  skipped: number
  failed: number
  errors: string[]
  warnings: string[]
  status: 'created' | 'updated' | 'skipped' | 'failed'
}

export async function saveListCandidate(candidate: SellSideListCandidate): Promise<SaveResult> {
  const normalizedCandidate = normalizeCandidate(candidate)
  const validation = validateListCandidate(normalizedCandidate)
  if (!validation.valid) {
    return {
      success: false,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 1,
      errors: validation.errors,
      warnings: validation.warnings,
      status: 'failed',
    }
  }

  const store = getStore()
  const slug = slugify([normalizedCandidate.institution, normalizedCandidate.listName, normalizedCandidate.year, normalizedCandidate.period].filter(Boolean).join(' '))

  const existing = await store.getConvictionList(slug)
  const list = existing
    ? await store.updateConvictionList(existing.id, {
      institution: normalizedCandidate.institution,
      listName: normalizedCandidate.listName,
      displayName: normalizedCandidate.displayName,
      year: normalizedCandidate.year,
      period: normalizedCandidate.period,
      theme: normalizedCandidate.theme,
      sector: normalizedCandidate.sector,
      region: normalizedCandidate.region,
      sourceUrl: normalizedCandidate.sourceUrl,
      sourceType: normalizedCandidate.sourceType,
      sourcePublisher: normalizedCandidate.sourcePublisher,
      confidence: normalizedCandidate.confidence,
      reviewStatus: normalizedCandidate.reviewStatus,
      rawSourceTitle: normalizedCandidate.rawSourceTitle,
      rawSourceExcerpt: normalizedCandidate.rawSourceExcerpt,
      importedFrom: normalizedCandidate.importedFrom,
      publishedAt: normalizedCandidate.publishedAt,
      notes: [normalizedCandidate.rawSourceExcerpt, `Imported from: ${normalizedCandidate.importedFrom ?? 'manual'}`].filter(Boolean).join('\n') || undefined,
    }) ?? existing
    : await store.createConvictionList({
      slug,
      institution: normalizedCandidate.institution,
      listName: normalizedCandidate.listName,
      displayName: normalizedCandidate.displayName,
      year: normalizedCandidate.year,
      period: normalizedCandidate.period,
      theme: normalizedCandidate.theme,
      sector: normalizedCandidate.sector,
      region: normalizedCandidate.region,
      sourceUrl: normalizedCandidate.sourceUrl,
      sourceType: normalizedCandidate.sourceType,
      sourcePublisher: normalizedCandidate.sourcePublisher,
      accessStatus: 'public',
      confidence: normalizedCandidate.confidence,
      reviewStatus: normalizedCandidate.reviewStatus,
      rawSourceTitle: normalizedCandidate.rawSourceTitle,
      rawSourceExcerpt: normalizedCandidate.rawSourceExcerpt,
      importedFrom: normalizedCandidate.importedFrom,
      publishedAt: normalizedCandidate.publishedAt,
      notes: [normalizedCandidate.rawSourceExcerpt, `Imported from: ${normalizedCandidate.importedFrom ?? 'manual'}`].filter(Boolean).join('\n') || undefined,
    })

  const existingMembers = await store.getConvictionListMembers(list.id)
  const existingMemberTickers = new Set(existingMembers.map((member) => member.ticker.toUpperCase()))
  let skippedMembers = 0

  for (const [index, member] of normalizedCandidate.members.entries()) {
    const ticker = member.ticker.toUpperCase()
    if (existingMemberTickers.has(ticker)) {
      skippedMembers += 1
      continue
    }

    await store.addConvictionListMember({
      convictionListId: list.id,
      ticker,
      companyName: member.companyName,
      rank: member.rank ?? index + 1,
      weight: member.weight,
      action: member.action,
      note: member.note,
      sourceText: member.sourceText,
    })
  }

  return {
    success: true,
    listId: list.id,
    url: `/conviction-lists/${list.id}`,
    created: existing ? 0 : 1,
    updated: existing ? 1 : 0,
    skipped: skippedMembers + (existing ? 0 : 0),
    failed: 0,
    errors: [],
    warnings: validation.warnings,
    status: existing ? 'updated' : 'created',
  }
}

function normalizeCandidate(candidate: SellSideListCandidate): SellSideListCandidate {
  const validSourceTypes = ['official_page', 'official_pdf', 'media_summary', 'manual', 'csv', 'paste', 'api'] as const
  const sourceType = validSourceTypes.includes(candidate.sourceType as typeof validSourceTypes[number])
    ? candidate.sourceType
    : 'manual'

  const reviewStatus = sourceType === 'media_summary'
    ? 'needs_review'
    : (['needs_review', 'verified', 'rejected'].includes(candidate.reviewStatus as 'needs_review' | 'verified' | 'rejected') ? candidate.reviewStatus : 'needs_review') as 'needs_review' | 'verified' | 'rejected'

  return {
    ...candidate,
    displayName: candidate.displayName || `${candidate.institution} ${candidate.listName}`.trim(),
    sourceType,
    confidence: candidate.confidence === 'verified' ? 'verified' : 'needs_review',
    reviewStatus,
    members: candidate.members.filter((member) => member.ticker?.trim()),
  }
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
