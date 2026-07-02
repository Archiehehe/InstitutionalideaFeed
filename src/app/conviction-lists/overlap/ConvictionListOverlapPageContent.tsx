'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { ChevronRight, Search, Copy, Eye, FolderPlus, X } from 'lucide-react'





interface OverlapListEntry {
  id: string
  displayName: string
  institution: string
  year?: number
  period?: string
  theme?: string
  sector?: string
  reviewStatus?: string
  confidence: 'verified' | 'needs_review'
  sourceType: string
  action?: string
  note?: string
}

interface OverlapRow {
  ticker: string
  companyName?: string
  mentionCount: number
  institutionCount: number
  listCount: number
  institutions: string[]
  lists: OverlapListEntry[]
  actions: string[]
  latestYear?: number
  latestPeriod?: string
  themes: string[]
  sectors: string[]
  reviewStatuses: string[]
  confidences: string[]
}

interface OverlapResponse {
  rows: OverlapRow[]
  count: number
  message: string
  summary: {
    totalTickers: number
    repeatedTickerCount: number
    verifiedMentions: number
    needsReviewMentions: number
  }
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wide text-[#6B7280]">{label}</div>
      <div className="mt-1 text-xl font-semibold text-[#E5E7EB]">{value}</div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs uppercase tracking-wide text-[#6B7280]">{title}</div>
    </div>
  )
}

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[#6B7280]">{label}</div>
      <div className="mt-0.5 text-xs text-[#E5E7EB]">{value}</div>
    </div>
  )
}

function InstitutionBreakdown({ lists }: { lists: OverlapListEntry[] }) {
  const byInst = useMemo(() => {
    const map = new Map<string, OverlapListEntry[]>()
    for (const l of lists) {
      const key = l.institution || '—'
      const arr = map.get(key) ?? []
      arr.push(l)
      map.set(key, arr)
    }
    return map
  }, [lists])

  const entries = Array.from(byInst.entries()).sort((a, b) => b[1].length - a[1].length)

  return (
    <div className="space-y-3">
      {entries.map(([institution, instLists]) => {
        const latest = instLists
          .filter((l) => l.year !== undefined || l.period)
          .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))[0]
        const latestLabel = latest?.period
          ? `${latest.period}${latest.year ? ` ${latest.year}` : ''}`
          : latest?.year
            ? String(latest.year)
            : '—'

        return (
          <div key={institution} className="rounded-md border border-[#1F1F1F] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium">{institution}</div>
              <div className="text-xs text-muted-foreground">{instLists.length} lists • Latest: {latestLabel}</div>
            </div>
            <div className="mt-2 space-y-2">
              {instLists
                .slice()
                .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
                .map((l) => (
                  <div key={`${l.id}:${l.year ?? ''}:${l.period ?? ''}:${l.displayName}`} className="text-xs text-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/conviction-lists/${l.id}`} className="hover:underline">
                      {l.displayName}
                    </Link>
                    <span className="text-muted-foreground">
                      {l.year ? `${l.year}` : ''}{l.period ? `${l.year ? ' ' : ''}${l.period}` : ''}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SignalSummary({
  row,
  derived,
}: {
  row: OverlapRow
  derived: {
    mentionedByInstitutionsCount: number
    mentionedByInstitutionsNames: string[]
    verifiedMentions: number
    needsReviewMentions: number
    topThemes: string[]
    topSectors: string[]
  }
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-3 text-xs">
        <div className="text-muted-foreground">Mentioned by {derived.mentionedByInstitutionsCount} institutions across {row.listCount} lists</div>
        <div className="mt-1">Verified mentions: {derived.verifiedMentions}</div>
        <div className="mt-0.5">Needs-review mentions: {derived.needsReviewMentions}</div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-3 text-xs">
          <div className="text-muted-foreground">Most common themes</div>
          <div className="mt-1 font-medium">{derived.topThemes.length ? derived.topThemes.join(', ') : '—'}</div>
        </div>
        <div className="rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-3 text-xs">
          <div className="text-muted-foreground">Most common sectors</div>
          <div className="mt-1 font-medium">{derived.topSectors.length ? derived.topSectors.join(', ') : '—'}</div>
        </div>
      </div>
    </div>
  )
}

export function ConvictionListOverlapPageContent() {

  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<OverlapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    institution: searchParams.get('institution') || '',
    year: searchParams.get('year') || '',
    sector: searchParams.get('sector') || '',
    theme: searchParams.get('theme') || '',
    reviewStatus: searchParams.get('reviewStatus') || '',
    confidence: searchParams.get('confidence') || '',
    sourceType: searchParams.get('sourceType') || '',
    minMentions: searchParams.get('minMentions') || '1',
  }), [searchParams])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const query = new URLSearchParams(searchParams.toString())
        const res = await fetch(`/api/conviction-lists/overlap?${query.toString()}`)
        if (!res.ok) throw new Error('Failed to load overlap data')
        setData(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overlap data')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [searchParams])

  if (error) return <ErrorState message={error} />
  if (loading || !data) return <LoadingState />

  const updateFilter = (key: string, value: string) => {


    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/conviction-lists/overlap?${params.toString()}`)
  }

  const handleSelectChange = (key: string, value: string | null) => {
    updateFilter(key, value ?? '')
  }

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const selectedRow = useMemo(() => {
    if (!selectedTicker) return null
    return data.rows.find((r) => r.ticker === selectedTicker) ?? null
  }, [data.rows, selectedTicker])

  const [watchlistSubmitting, setWatchlistSubmitting] = useState(false)

  const addTickerToWatchlist = async (ticker: string) => {
    try {
      setWatchlistSubmitting(true)
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      })
      // If duplicate, API may return duplicate flag; UI doesn't need to block.
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.error('Failed to add to watchlist')
      }
    } finally {
      setWatchlistSubmitting(false)
    }
  }

  const copyTicker = async (ticker: string) => {
    try {
      await navigator.clipboard.writeText(ticker)
    } catch {
      // eslint-disable-next-line no-console
      console.error('Failed to copy ticker')
    }
  }

  const closeDrawer = () => setSelectedTicker(null)

  const derivedSignalSummary = (row: OverlapRow) => {

    const lists = row.lists
    const mentionedByInstitutions = Array.from(new Set(lists.map((l) => l.institution))).filter(Boolean)
    const verifiedMentions = lists.filter((l) => l.confidence === 'verified').length
    const needsReviewMentions = lists.filter((l) => l.confidence === 'needs_review').length

    const themeCounts = new Map<string, number>()
    const sectorCounts = new Map<string, number>()
    for (const l of lists) {
      if (l.theme) themeCounts.set(l.theme, (themeCounts.get(l.theme) ?? 0) + 1)
      if (l.sector) sectorCounts.set(l.sector, (sectorCounts.get(l.sector) ?? 0) + 1)
    }

    const topThemes = Array.from(themeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t)

    const topSectors = Array.from(sectorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([s]) => s)

    return {
      mentionedByInstitutionsCount: mentionedByInstitutions.length,
      mentionedByInstitutionsNames: mentionedByInstitutions,
      verifiedMentions,
      needsReviewMentions,
      topThemes,
      topSectors,
    }
  }

  const rows = data.rows

  const institutions = Array.from(new Set(rows.flatMap((row) => row.institutions))).sort()
  const years = Array.from(new Set(rows.flatMap((row) => row.lists.map((list) => list.year).filter((year): year is number => year !== undefined)))).sort((a, b) => b - a)
  const themes = Array.from(new Set(rows.flatMap((row) => row.themes))).sort()
  const sectors = Array.from(new Set(rows.flatMap((row) => row.sectors))).sort()
  const reviewStatuses = Array.from(new Set(rows.flatMap((row) => row.reviewStatuses))).sort()
  const confidences = Array.from(new Set(rows.flatMap((row) => row.confidences))).sort()
  const sourceTypes = Array.from(new Set(rows.flatMap((row) => row.lists.map((list) => list.sourceType)))).sort()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Conviction List Overlap</h1>
          <p className="text-sm text-muted-foreground">Find stocks repeatedly appearing across sell-side lists. Repeated mentions are not recommendations by themselves; use this as a research discovery layer.</p>
        </div>
        <Link href="/conviction-lists">
          <Button variant="outline" size="sm">Back to Conviction Lists</Button>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total tickers</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{data.summary.totalTickers}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">2+ list mentions</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{data.summary.repeatedTickerCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Verified-list mentions</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{data.summary.verifiedMentions}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Needs-review mentions</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{data.summary.needsReviewMentions}</CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs font-medium">Search ticker/company</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} className="pl-8" placeholder="SNOW or Snowflake" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Institution</label>
          <Select value={filters.institution || 'all'} onValueChange={(value) => handleSelectChange('institution', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {institutions.map((institution) => <SelectItem key={institution} value={institution}>{institution}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Year</label>
          <Select value={filters.year || 'all'} onValueChange={(value) => handleSelectChange('year', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Minimum mentions</label>
          <Select value={filters.minMentions || '1'} onValueChange={(value) => handleSelectChange('minMentions', value)}>
            <SelectTrigger><SelectValue placeholder="1" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Sector</label>
          <Select value={filters.sector || 'all'} onValueChange={(value) => handleSelectChange('sector', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {sectors.map((sector) => <SelectItem key={sector} value={sector}>{sector}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Theme</label>
          <Select value={filters.theme || 'all'} onValueChange={(value) => handleSelectChange('theme', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {themes.map((theme) => <SelectItem key={theme} value={theme}>{theme}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Review status</label>
          <Select value={filters.reviewStatus || 'all'} onValueChange={(value) => handleSelectChange('reviewStatus', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {reviewStatuses.map((reviewStatus) => <SelectItem key={reviewStatus} value={reviewStatus}>{reviewStatus}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Confidence</label>
          <Select value={filters.confidence || 'all'} onValueChange={(value) => handleSelectChange('confidence', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {confidences.map((confidence) => <SelectItem key={confidence} value={confidence}>{confidence}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Source type</label>
          <Select value={filters.sourceType || 'all'} onValueChange={(value) => handleSelectChange('sourceType', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {sourceTypes.map((sourceType) => <SelectItem key={sourceType} value={sourceType}>{sourceType}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No overlap yet"
          description={data.message}
          actions={[
            { label: 'Find Lists', onClick: () => router.push('/sell-side-list-finder') },
            { label: 'Back to Conviction Lists', onClick: () => router.push('/conviction-lists') },
          ]}
        />
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">Ticker</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Mentions</th>
                <th className="px-3 py-2">Institutions</th>
                <th className="px-3 py-2">Themes / Sectors</th>
                <th className="px-3 py-2">Latest</th>
                <th className="px-3 py-2">Confidence / Review</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.ticker}
                  className="border-t align-top cursor-pointer hover:bg-muted/20"
                  onClick={() => setSelectedTicker(row.ticker)}
                >
                  <td className="px-3 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{row.ticker}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </td>
                  <td className="px-3 py-3">{row.companyName ?? '—'}</td>
                  <td className="px-3 py-3">{row.mentionCount}</td>
                  <td className="px-3 py-3">{row.institutions.join(', ') || '—'}</td>
                  <td className="px-3 py-3">{[...row.themes, ...row.sectors].slice(0, 3).join(' / ') || '—'}</td>
                  <td className="px-3 py-3">{row.latestPeriod ? `${row.latestPeriod}${row.latestYear ? ` ${row.latestYear}` : ''}` : row.latestYear ?? '—'}</td>
                  <td className="px-3 py-3">{row.confidences.join(', ') || '—'} / {row.reviewStatuses.join(', ') || '—'}</td>
                  <td className="px-3 py-3">{row.actions.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* Ticker intelligence drawer */}
      {selectedRow && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-[#0A0A0A] border-l border-[#1F1F1F]">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedRow.ticker}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedRow.companyName ? selectedRow.companyName : '—'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeDrawer} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Mention count" value={String(selectedRow.mentionCount)} />
                <Stat label="Institution count" value={String(selectedRow.institutionCount)} />
                <Stat
                  label="Latest"
                  value={
                    selectedRow.latestPeriod
                      ? `${selectedRow.latestPeriod}${selectedRow.latestYear ? ` ${selectedRow.latestYear}` : ''}`
                      : selectedRow.latestYear
                        ? String(selectedRow.latestYear)
                        : '—'
                  }
                  className="col-span-2"
                />
              </div>

              <div className="mt-5 rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" /> Research drawer (not investment advice)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={watchlistSubmitting}
                      onClick={() => addTickerToWatchlist(selectedRow.ticker)}
                    >
                      <FolderPlus className="h-3.5 w-3.5" /> Add to Watchlist
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => copyTicker(selectedRow.ticker)}>
                      <Copy className="h-3.5 w-3.5" /> Copy ticker
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <SectionTitle title="Appears in Lists" />
                <div className="space-y-3">
                  {selectedRow.lists.length === 0 ? (
                    <EmptyState
                      title="No list records for this ticker"
                      description="This ticker currently has no conviction list entries in the selected filters."
                      actions={[]}
                    />
                  ) : (
                    selectedRow.lists.map((entry) => (
                      <div key={entry.id + ':' + entry.institution + ':' + entry.year + ':' + entry.period} className="rounded-md border border-[#1F1F1F] p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <Link href={`/conviction-lists/${entry.id}`} className="text-sm font-medium hover:underline">
                              {entry.displayName}
                            </Link>
                            <div className="mt-1 text-xs text-muted-foreground">Institution: {entry.institution}</div>
                            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                              <FieldLine label="Year / Period" value={entry.year ? `${entry.year}${entry.period ? ` ${entry.period}` : ''}` : entry.period ?? '—'} />
                              <FieldLine label="Theme / Sector" value={[entry.theme, entry.sector].filter(Boolean).join(' / ') || '—'} />
                              <FieldLine label="Review status" value={entry.reviewStatus ?? '—'} />
                              <FieldLine label="Confidence" value={entry.confidence.replace('_', ' ')} />
                              <FieldLine label="Source type" value={entry.sourceType.replace('_', ' ')} />
                              <FieldLine label="Member action" value={entry.action ?? '—'} />
                              <FieldLine label="Member note" value={entry.note ?? '—'} />
                            </div>
                          </div>
                          <div className="shrink-0">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                              <Link href={`/conviction-lists/${entry.id}`}>Open</Link>
                            </Button>

                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <SectionTitle title="Institution Breakdown" />
                <InstitutionBreakdown lists={selectedRow.lists} />

                <SectionTitle title="Signal Summary" />
                <SignalSummary row={selectedRow} derived={derivedSignalSummary(selectedRow)} />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="text-xs text-muted-foreground">Most common themes/sectors are derived from list metadata in the current result set.</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push(`/conviction-lists?search=${selectedRow.ticker}`)}>
                      <Search className="h-3.5 w-3.5" /> Open related conviction lists
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

