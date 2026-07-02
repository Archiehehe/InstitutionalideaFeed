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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  ChevronRight,
  Search,
  Copy,
  Eye,
  FolderPlus,
  X,
  CheckSquare,
  Square,
} from 'lucide-react'

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

type ConfidenceValue = 'verified' | 'needs_review'

type SelectedTickerMeta = {
  ticker: string
  companyName?: string
  mentionCount: number
  institutionCount: number
  themes: string[]
  sectors: string[]
  lists: OverlapListEntry[]
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
  return <div className="text-xs uppercase tracking-wide text-[#6B7280]">{title}</div>
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
              <div className="text-xs text-muted-foreground">
                {instLists.length} lists • Latest: {latestLabel}
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {instLists
                .slice()
                .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
                .map((l) => (
                  <div
                    key={`${l.id}:${l.year ?? ''}:${l.period ?? ''}:${l.displayName}`}
                    className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#E5E7EB]"
                  >
                    <Link href={`/conviction-lists/${l.id}`} className="hover:underline">
                      {l.displayName}
                    </Link>
                    <span className="text-muted-foreground">
                      {l.year ? `${l.year}` : ''}
                      {l.period ? `${l.year ? ' ' : ''}${l.period}` : ''}
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

function SignalSummary({ row }: { row: OverlapRow }) {
  const { topThemes, topSectors, mentionedByInstitutionsCount, verifiedMentions, needsReviewMentions } =
    useMemo(() => {
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
        topThemes,
        topSectors,
        mentionedByInstitutionsCount: mentionedByInstitutions.length,
        verifiedMentions,
        needsReviewMentions,
      }
    }, [row])

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-3 text-xs">
        <div className="text-muted-foreground">
          Mentioned by {mentionedByInstitutionsCount} institutions across {row.listCount} lists
        </div>
        <div className="mt-1">Verified mentions: {verifiedMentions}</div>
        <div className="mt-0.5">Needs-review mentions: {needsReviewMentions}</div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-3 text-xs">
          <div className="text-muted-foreground">Most common themes</div>
          <div className="mt-1 font-medium">{topThemes.length ? topThemes.join(', ') : '—'}</div>
        </div>
        <div className="rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-3 text-xs">
          <div className="text-muted-foreground">Most common sectors</div>
          <div className="mt-1 font-medium">{topSectors.length ? topSectors.join(', ') : '—'}</div>
        </div>
      </div>
    </div>
  )
}

function normalizeClipboardText(value: string) {
  return value.trim().toUpperCase()
}

export function ConvictionListOverlapPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<OverlapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Drawer selection
  const [selectedTickerForDrawer, setSelectedTickerForDrawer] = useState<string | null>(null)

  // Multi-selection
  const [selectedTickers, setSelectedTickers] = useState<Map<string, SelectedTickerMeta>>(new Map())
  const selectedCount = selectedTickers.size

  // Basket modal
  const [basketDialogOpen, setBasketDialogOpen] = useState(false)
  const [basketName, setBasketName] = useState('')
  const [basketNote, setBasketNote] = useState('')
  const [basketSubmitting, setBasketSubmitting] = useState(false)
  const [basketFeedback, setBasketFeedback] = useState<string | null>(null)

  // Sticky bar copy success
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      institution: searchParams.get('institution') || '',
      year: searchParams.get('year') || '',
      sector: searchParams.get('sector') || '',
      theme: searchParams.get('theme') || '',
      reviewStatus: searchParams.get('reviewStatus') || '',
      confidence: searchParams.get('confidence') || '',
      sourceType: searchParams.get('sourceType') || '',
      minMentions: searchParams.get('minMentions') || '1',
    }),
    [searchParams],
  )

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

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/conviction-lists/overlap?${params.toString()}`)
  }

  const handleSelectChange = (key: string, value: string | null) => {
    updateFilter(key, value ?? '')
  }

  const safeRows = data?.rows ?? []

  const institutions = useMemo(() => Array.from(new Set(safeRows.flatMap((row) => row.institutions))).sort(), [safeRows])
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          safeRows.flatMap((row) => row.lists.map((list) => list.year).filter((y): y is number => y !== undefined)),
        ),
      ).sort((a, b) => b - a),
    [safeRows],
  )
  const themes = useMemo(() => Array.from(new Set(safeRows.flatMap((row) => row.themes))).sort(), [safeRows])
  const sectors = useMemo(() => Array.from(new Set(safeRows.flatMap((row) => row.sectors))).sort(), [safeRows])
  const reviewStatuses = useMemo(
    () => Array.from(new Set(safeRows.flatMap((row) => row.reviewStatuses))).sort(),
    [safeRows],
  )
  const confidences = useMemo(
    () => Array.from(new Set(safeRows.flatMap((row) => row.confidences))).sort(),
    [safeRows],
  )
  const sourceTypes = useMemo(
    () => Array.from(new Set(safeRows.flatMap((row) => row.lists.map((list) => list.sourceType)))).sort(),
    [safeRows],
  )

  const selectedTickerRow = useMemo(() => {
    if (!selectedTickerForDrawer) return null
    return safeRows.find((r) => r.ticker === selectedTickerForDrawer) ?? null
  }, [safeRows, selectedTickerForDrawer])

  // Best-effort preserve: keep selections that still exist in currently loaded filtered rows.
  useEffect(() => {
    setSelectedTickers((prev) => {
      if (prev.size === 0) return prev
      const currentTickers = new Set(safeRows.map((r) => r.ticker))
      const next = new Map<string, SelectedTickerMeta>()
      for (const [ticker, meta] of prev.entries()) {
        if (currentTickers.has(ticker)) next.set(ticker, meta)
      }
      return next
    })
  }, [safeRows])

  const setSelection = (ticker: string, meta?: SelectedTickerMeta) => {
    const t = normalizeClipboardText(ticker)
    setSelectedTickers((prev) => {
      const next = new Map(prev)
      if (next.has(t)) return next
      if (!meta) {
        const row = safeRows.find((r) => r.ticker === t)
        if (!row) return next
        meta = {
          ticker: t,
          companyName: row.companyName,
          mentionCount: row.mentionCount,
          institutionCount: row.institutionCount,
          themes: row.themes,
          sectors: row.sectors,
          lists: row.lists,
        }
      }
      next.set(t, meta)
      return next
    })
  }

  const removeSelection = (ticker: string) => {
    const t = normalizeClipboardText(ticker)
    setSelectedTickers((prev) => {
      const next = new Map(prev)
      next.delete(t)
      return next
    })
  }

  const toggleSelection = (ticker: string) => {
    const t = normalizeClipboardText(ticker)
    setSelectedTickers((prev) => {
      const next = new Map(prev)
      if (next.has(t)) {
        next.delete(t)
        return next
      }
      const row = safeRows.find((r) => r.ticker === t)
      if (!row) return next
      next.set(t, {
        ticker: t,
        companyName: row.companyName,
        mentionCount: row.mentionCount,
        institutionCount: row.institutionCount,
        themes: row.themes,
        sectors: row.sectors,
        lists: row.lists,
      })
      return next
    })
  }

  const isSelected = (ticker: string) => selectedTickers.has(normalizeClipboardText(ticker))

  const copyTickers = async (tickers: string[]) => {
    const normalized = Array.from(new Set(tickers.map(normalizeClipboardText))).filter(Boolean)
    try {
      await navigator.clipboard.writeText(normalized.join(', '))
      setCopyFeedback(`Copied ${normalized.length} ticker${normalized.length === 1 ? '' : 's'}`)
      window.setTimeout(() => setCopyFeedback(null), 1800)
    } catch {
      // no alert
    }
  }

  const dedupedSelectedTickers = useMemo(() => Array.from(selectedTickers.keys()), [selectedTickers])

  const addSelectedToWatchlist = async () => {
    const tickers = Array.from(new Set(dedupedSelectedTickers)).filter(Boolean)
    if (tickers.length === 0) return

    let added = 0
    let skipped = 0
    let failed = 0
    const failedTickers: string[] = []

    for (const ticker of tickers) {
      try {
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker }),
        })

        if (!res.ok) {
          failed++
          failedTickers.push(ticker)
          continue
        }

        const json = await res.json().catch(() => ({} as any))
        if (json?.duplicate) {
          skipped++
        } else {
          added++
        }
      } catch {
        failed++
        failedTickers.push(ticker)
      }
    }

    // inline feedback (no alert)
    setBasketFeedback(
      `Watchlist update: added ${added}, skipped ${skipped}, failed ${failed}$${failedTickers.length ? ` (${failedTickers.join(', ')})` : ''}`
        .replace('$', '')
        .trim(),
    )
    window.setTimeout(() => setBasketFeedback(null), 4000)
  }

  const openBasketDialog = () => {
    const today = new Date()
    const defaultName = `Conviction Overlap Basket - ${today.toLocaleDateString()}`
    setBasketName(defaultName)
    setBasketNote('')
    setBasketFeedback(null)
    setBasketDialogOpen(true)
  }

  const saveBasketFromSelection = async () => {
    const tickers = Array.from(new Set(dedupedSelectedTickers))
    if (tickers.length === 0) {
      setBasketFeedback('No tickers selected.')
      return
    }

    const name = basketName.trim()
    if (!name) {
      setBasketFeedback('Basket name is required.')
      return
    }

    try {
      setBasketSubmitting(true)
      setBasketFeedback(null)
      const body: Record<string, unknown> = {
        name,
        tickers,
        notes: basketNote.trim() ? basketNote.trim() : undefined,
      }

      const res = await fetch('/api/baskets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json().catch(() => ({} as any))

      if (!res.ok) {
        setBasketFeedback(json?.error ?? 'Failed to save basket.')
        return
      }

      if (json?.duplicate) {
        setBasketFeedback('Basket already exists.')
      } else {
        setBasketFeedback(`Basket saved: ${json?.name ?? name}`)
      }

      window.setTimeout(() => {
        setBasketDialogOpen(false)
        setBasketSubmitting(false)
      }, 900)
    } catch {
      setBasketFeedback('Failed to save basket.')
    } finally {
      setBasketSubmitting(false)
    }
  }

  const selectedRowTickersInView = useMemo(() => safeRows.map((r) => r.ticker), [safeRows])

  const selectAllVisible = () => {
    setSelectedTickers((prev) => {
      const next = new Map(prev)
      for (const r of safeRows) {
        const t = normalizeClipboardText(r.ticker)
        if (!next.has(t)) {
          next.set(t, {
            ticker: t,
            companyName: r.companyName,
            mentionCount: r.mentionCount,
            institutionCount: r.institutionCount,
            themes: r.themes,
            sectors: r.sectors,
            lists: r.lists,
          })
        }
      }
      return next
    })
  }

  const isAllVisibleSelected = useMemo(() => {
    if (safeRows.length === 0) return false
    for (const r of safeRows) {
      if (!isSelected(r.ticker)) return false
    }
    return true
  }, [safeRows, selectedTickers])

  const clearSelection = () => {
    setSelectedTickers(new Map())
    setBasketFeedback(null)
  }

  const smartSelect = (predicate: (row: OverlapRow) => boolean) => {
    const toAdd = safeRows.filter(predicate)
    if (toAdd.length === 0) return
    setSelectedTickers((prev) => {
      const next = new Map(prev)
      for (const r of toAdd) {
        const t = normalizeClipboardText(r.ticker)
        if (!next.has(t)) {
          next.set(t, {
            ticker: t,
            companyName: r.companyName,
            mentionCount: r.mentionCount,
            institutionCount: r.institutionCount,
            themes: r.themes,
            sectors: r.sectors,
            lists: r.lists,
          })
        }
      }
      return next
    })
  }

  if (error) return <ErrorState message={error} />
  if (loading || !data) return <LoadingState />

  if (data.rows.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Conviction List Overlap</h1>
            <p className="text-sm text-muted-foreground">Find stocks repeatedly appearing across sell-side lists.</p>
          </div>
          <Link href="/conviction-lists">
            <Button variant="outline" size="sm">Back to Conviction Lists</Button>
          </Link>
        </div>
        <EmptyState
          title="No overlap yet"
          description={data.message}
          actions={[
            { label: 'Find Lists', onClick: () => router.push('/sell-side-list-finder') },
            { label: 'Back to Conviction Lists', onClick: () => router.push('/conviction-lists') },
          ]}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Conviction List Overlap</h1>
          <p className="text-sm text-muted-foreground">
            Find stocks repeatedly appearing across sell-side lists. Mentions are discovery signals, not recommendations by themselves.
          </p>
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

      {/* Filters */}
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
              {institutions.map((institution) => (
                <SelectItem key={institution} value={institution}>{institution}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Year</label>
          <Select value={filters.year || 'all'} onValueChange={(value) => handleSelectChange('year', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
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
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Theme</label>
          <Select value={filters.theme || 'all'} onValueChange={(value) => handleSelectChange('theme', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {themes.map((theme) => (
                <SelectItem key={theme} value={theme}>{theme}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Review status</label>
          <Select value={filters.reviewStatus || 'all'} onValueChange={(value) => handleSelectChange('reviewStatus', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {reviewStatuses.map((reviewStatus) => (
                <SelectItem key={reviewStatus} value={reviewStatus}>{reviewStatus}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Confidence</label>
          <Select value={filters.confidence || 'all'} onValueChange={(value) => handleSelectChange('confidence', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {confidences.map((confidence) => (
                <SelectItem key={confidence} value={confidence}>{confidence}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Source type</label>
          <Select value={filters.sourceType || 'all'} onValueChange={(value) => handleSelectChange('sourceType', value === 'all' ? '' : value)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {sourceTypes.map((sourceType) => (
                <SelectItem key={sourceType} value={sourceType}>{sourceType}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Smart select */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => smartSelect((r) => r.mentionCount >= 2)}>
          Select 2+ mentions
        </Button>
        <Button variant="outline" size="sm" onClick={() => smartSelect((r) => r.institutionCount >= 2)}>
          Select 2+ institutions
        </Button>
        <Button variant="outline" size="sm" onClick={() => smartSelect((r) => r.lists.some((l) => l.confidence === 'verified'))}>
          Verified-only mentions
        </Button>
        <Button variant="outline" size="sm" onClick={() => smartSelect((r) => r.lists.some((l) => l.confidence === 'needs_review'))}>
          Needs-review mentions
        </Button>
        <Button variant="ghost" size="sm" onClick={clearSelection} disabled={selectedCount === 0}>
          Clear selection
        </Button>
      </div>

      {selectedCount > 0 && (
        <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-[#0A0A0A] border-b border-[#1F1F1F]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Selected: <span className="text-[#E5E7EB] font-semibold">{selectedCount}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearSelection}>Clear selection</Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => copyTickers(dedupedSelectedTickers)}>
                <Copy className="h-3.5 w-3.5" /> Copy tickers
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={addSelectedToWatchlist}>
                <Eye className="h-3.5 w-3.5" /> Add selected to Watchlist
              </Button>
              <Button variant="outline" size="sm" onClick={openBasketDialog}>
                <FolderPlus className="h-3.5 w-3.5" /> Save selected as Basket
              </Button>
            </div>
          </div>
          {copyFeedback && <div className="mt-2 text-xs text-blue-300">{copyFeedback}</div>}
          {basketFeedback && <div className="mt-2 text-xs text-blue-300">{basketFeedback}</div>}
        </div>
      )}

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all visible tickers"
                  checked={isAllVisibleSelected}
                  onChange={(e) => {
                    const checked = e.target.checked
                    e.preventDefault()
                    if (checked) selectAllVisible()
                    else {
                      const visible = new Set(safeRows.map((r) => normalizeClipboardText(r.ticker)))
                      setSelectedTickers((prev) => {
                        const next = new Map(prev)
                        for (const t of visible) next.delete(t)
                        return next
                      })
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </th>
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
            {safeRows.map((row) => {
              const checked = isSelected(row.ticker)
              return (
                <tr
                  key={row.ticker}
                  className="border-t align-top cursor-pointer hover:bg-muted/20"
                  onClick={() => setSelectedTickerForDrawer(row.ticker)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.ticker}`}
                      checked={checked}
                      onChange={(e) => {
                        const nextChecked = e.target.checked
                        if (nextChecked) setSelection(row.ticker)
                        else removeSelection(row.ticker)
                      }}
                    />
                  </td>
                  <td className="px-3 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{row.ticker}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </td>
                  <td className="px-3 py-3">{row.companyName ?? '—'}</td>
                  <td className="px-3 py-3">{row.mentionCount}</td>
                  <td className="px-3 py-3">{row.institutions.join(', ') || '—'}</td>
                  <td className="px-3 py-3">
                    {[...row.themes, ...row.sectors].slice(0, 3).join(' / ') || '—'
                    }
                  </td>
                  <td className="px-3 py-3">
                    {row.latestPeriod
                      ? `${row.latestPeriod}${row.latestYear ? ` ${row.latestYear}` : ''}`
                      : row.latestYear ?? '—'}
                  </td>
                  <td className="px-3 py-3">{row.confidences.join(', ') || '—'} / {row.reviewStatuses.join(', ') || '—'}</td>
                  <td className="px-3 py-3">{row.actions.join(', ') || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selectedTickerRow && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedTickerForDrawer(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-[#0A0A0A] border-l border-[#1F1F1F]">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedTickerRow.ticker}</h2>
                  <p className="text-sm text-muted-foreground">{selectedTickerRow.companyName ?? '—'}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedTickerForDrawer(null)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Mention count" value={String(selectedTickerRow.mentionCount)} />
                <Stat label="Institution count" value={String(selectedTickerRow.institutionCount)} />
                <Stat
                  label="Latest"
                  className="col-span-2"
                  value={
                    selectedTickerRow.latestPeriod
                      ? `${selectedTickerRow.latestPeriod}${selectedTickerRow.latestYear ? ` ${selectedTickerRow.latestYear}` : ''}`
                      : selectedTickerRow.latestYear
                        ? String(selectedTickerRow.latestYear)
                        : '—'
                  }
                />
              </div>

              <div className="mt-5 rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Use selections to turn repeated sell-side mentions into a research basket. Mentions are discovery signals, not recommendations.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => toggleSelection(selectedTickerRow.ticker)}
                    >
                      {isSelected(selectedTickerRow.ticker) ? (
                        <Square className="h-3.5 w-3.5" />
                      ) : (
                        <CheckSquare className="h-3.5 w-3.5" />
                      )}
                      {isSelected(selectedTickerRow.ticker) ? 'Unselect this ticker' : 'Select this ticker'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" disabled={false} onClick={() => {
                      setSelectedTickers((prev) => {
                        if (prev.has(selectedTickerRow.ticker)) return prev
                        const next = new Map(prev)
                        next.set(selectedTickerRow.ticker, {
                          ticker: selectedTickerRow.ticker,
                          companyName: selectedTickerRow.companyName,
                          mentionCount: selectedTickerRow.mentionCount,
                          institutionCount: selectedTickerRow.institutionCount,
                          themes: selectedTickerRow.themes,
                          sectors: selectedTickerRow.sectors,
                          lists: selectedTickerRow.lists,
                        })
                        return next
                      })
                      void (async () => {
                        try {
                          await fetch('/api/watchlist', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ticker: selectedTickerRow.ticker }),
                          })
                        } catch {
                          // no alert
                        }
                      })()
                    }}>
                      <FolderPlus className="h-3.5 w-3.5" /> Add this ticker to Watchlist
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => copyTickers([selectedTickerRow.ticker])}>
                      <Copy className="h-3.5 w-3.5" /> Copy ticker
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div className="space-y-3">
                  <SectionTitle title="Appears in Lists" />
                  {selectedTickerRow.lists.length === 0 ? (
                    <EmptyState
                      title="No list records for this ticker"
                      description="This ticker currently has no conviction list entries in the selected filters."
                      actions={[]}
                    />
                  ) : (
                    <div className="space-y-3">
                      {selectedTickerRow.lists.map((entry) => (
                        <div
                          key={`${entry.id}:${entry.institution}:${entry.year ?? ''}:${entry.period ?? ''}`}
                          className="rounded-md border border-[#1F1F1F] p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <Link
                                href={`/conviction-lists/${entry.id}`}
                                className="text-sm font-medium hover:underline"
                              >
                                {entry.displayName}
                              </Link>
                              <div className="mt-1 text-xs text-muted-foreground">Institution: {entry.institution}</div>
                              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                <FieldLine
                                  label="Year / Period"
                                  value={entry.year ? `${entry.year}${entry.period ? ` ${entry.period}` : ''}` : entry.period ?? '—'}
                                />
                                <FieldLine
                                  label="Theme / Sector"
                                  value={[entry.theme, entry.sector].filter(Boolean).join(' / ') || '—'}
                                />
                                <FieldLine label="Review status" value={entry.reviewStatus ?? '—'} />
                                <FieldLine label="Confidence" value={entry.confidence.replace('_', ' ')} />
                                <FieldLine label="Source type" value={entry.sourceType.replace('_', ' ')} />
                                <FieldLine label="Member action" value={entry.action ?? '—'} />
                                <FieldLine label="Member note" value={entry.note ?? '—'} />
                              </div>
                            </div>
                            <div className="shrink-0">
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <Link href={`/conviction-lists/${entry.id}`}>Open</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <SectionTitle title="Institution Breakdown" />
                  <InstitutionBreakdown lists={selectedTickerRow.lists} />
                </div>

                <div className="space-y-3">
                  <SectionTitle title="Signal Summary" />
                  <SignalSummary row={selectedTickerRow} />
                </div>

                <Separator />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">Most common themes/sectors are derived from the current result set.</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push(`/conviction-lists?search=${selectedTickerRow.ticker}`)}>
                      <Search className="h-3.5 w-3.5" /> Open related conviction lists
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => copyTickers([selectedTickerRow.ticker])}>
                      <Copy className="h-3.5 w-3.5" /> Copy ticker
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

