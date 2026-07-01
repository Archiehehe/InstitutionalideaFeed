import type { SellSideListCandidate } from './types'
import { getStore } from '@/lib/storage'
import { validateListCandidate } from './validateListCandidate'

export interface SaveResult {
  success: boolean
  listId?: string
  errors: string[]
  warnings: string[]
  status: 'created' | 'updated' | 'skipped'
}

export async function saveListCandidate(candidate: SellSideListCandidate): Promise<SaveResult> {
  const validation = validateListCandidate(candidate)
  if (!validation.valid) {
    return { success: false, errors: validation.errors, warnings: validation.warnings, status: 'skipped' }
  }

  const store = getStore()
  const slug = slugify([candidate.institution, candidate.listName, candidate.year].filter(Boolean).join(' '))

  const existing = await store.getConvictionList(slug)
  if (existing) {
    // TODO: Check if we need to update anything (members, etc.)
    return { success: true, listId: existing.id, errors: [], warnings: validation.warnings, status: 'skipped' }
  }

  const validSourceTypes = ['official_page', 'official_pdf', 'media_summary', 'manual', 'csv', 'paste', 'api'] as const
  const sourceType = validSourceTypes.includes(candidate.sourceType as typeof validSourceTypes[number])
    ? candidate.sourceType
    : 'manual'

  const list = await store.createConvictionList({
    slug,
    institution: candidate.institution,
    listName: candidate.listName,
    displayName: candidate.displayName,
    year: candidate.year,
    period: candidate.period,
    theme: candidate.theme,
    sector: candidate.sector,
    region: candidate.region,
    sourceUrl: candidate.sourceUrl,
    sourceType,
    sourcePublisher: candidate.sourcePublisher,
    accessStatus: 'public',
    confidence: candidate.confidence,
    reviewStatus: candidate.reviewStatus,
    rawSourceTitle: candidate.rawSourceTitle,
    rawSourceExcerpt: candidate.rawSourceExcerpt,
    importedFrom: candidate.importedFrom,
    publishedAt: candidate.publishedAt,
    notes: [candidate.rawSourceExcerpt, `Imported from: ${candidate.importedFrom ?? 'manual'}`].filter(Boolean).join('\n') || undefined,
  })

  for (const [index, member] of candidate.members.entries()) {
    await store.addConvictionListMember({
      convictionListId: list.id,
      ticker: member.ticker.toUpperCase(),
      companyName: member.companyName,
      rank: member.rank ?? index + 1,
      weight: member.weight,
      action: member.action,
      note: member.note,
      sourceText: member.sourceText,
    })
  }

  return { success: true, listId: list.id, errors: [], warnings: validation.warnings, status: 'created' }
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
