'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingState } from '@/components/LoadingState'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { ListFinderQuery, PartialCandidate, SellSideListCandidate } from '@/lib/sellSideLists/types'

interface SellSideFormState {
  institution: string
  listName: string
  year: string
  period: string
  theme: string
  sector: string
  region: string
  sourcePublisher: string
  sourceUrl: string
  sourceType: SellSideListCandidate['sourceType']
  confidence: SellSideListCandidate['confidence']
  rawSourceTitle: string
  rawSourceExcerpt: string
  tickers: string
}

interface SaveResponse {
  success: boolean
  created: number
  updated: number
  skipped: number
  failed: number
  errors: string[]
  warnings: string[]
  convictionListId?: string
  url?: string
  status?: string
}

const initialFormState: SellSideFormState = {
  institution: '',
  listName: '',
  year: '',
  period: '',
  theme: '',
  sector: '',
  region: '',
  sourcePublisher: '',
  sourceUrl: '',
  sourceType: 'media_summary',
  confidence: 'needs_review',
  rawSourceTitle: '',
  rawSourceExcerpt: '',
  tickers: '',
}

export default function SellSideListFinderPage() {
  const [windowInfo, setWindowInfo] = useState<{ from: string; to: string } | null>(null)
  const [queries, setQueries] = useState<ListFinderQuery[]>([])
  const [partialCandidates, setPartialCandidates] = useState<PartialCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<SellSideFormState>(initialFormState)
  const [preview, setPreview] = useState<SellSideListCandidate | null>(null)
  const [saveResult, setSaveResult] = useState<SaveResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const tickersRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [queriesResponse, partialResponse] = await Promise.all([
          fetch('/api/sell-side-list-finder/queries'),
          fetch('/api/sell-side-list-finder/partial-candidates'),
        ])

        const queriesData = await queriesResponse.json()
        const partialData = await partialResponse.json()

        setWindowInfo({
          from: new Date(queriesData.window.fromDate).toLocaleDateString(),
          to: new Date(queriesData.window.toDate).toLocaleDateString(),
        })
        setQueries(queriesData.queries ?? [])
        setPartialCandidates(partialData ?? [])
      } catch {
        setError('Could not load the sell-side finder data.')
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  const groupedQueries = useMemo(() => {
    const groups = new Map<string, ListFinderQuery[]>()
    for (const query of queries) {
      const bucket = query.category || 'General'
      const existing = groups.get(bucket) ?? []
      existing.push(query)
      groups.set(bucket, existing)
    }
    return Array.from(groups.entries())
  }, [queries])

  const validateCandidate = (candidate: Partial<SellSideListCandidate>): string[] => {
    const errors: string[] = []
    const sourceType = candidate.sourceType ?? 'media_summary'
    if (!candidate.institution?.trim()) errors.push('Institution is required.')
    if (!candidate.listName?.trim()) errors.push('List name is required.')
    if ((candidate.members?.filter((member) => member.ticker?.trim()).length ?? 0) < 3) errors.push('3+ tickers required.')
    if (!['manual', 'csv', 'paste'].includes(sourceType) && !(candidate.sourceUrl ?? '').trim()) {
      errors.push('Source URL is required unless source type is manual, paste, or csv.')
    }
    if (sourceType === 'media_summary' && candidate.reviewStatus !== 'needs_review') {
      errors.push('Media summaries must remain needs_review.')
    }
    return errors
  }

  const handleParse = async () => {
    setError(null)
    setValidationErrors([])
    setSaveResult(null)
    setIsParsing(true)

    try {
      const response = await fetch('/api/sell-side-list-finder/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? Number(formData.year) : undefined,
          text: formData.tickers,
        }),
      })
      const data = await response.json()
      const parsedPreview = data.preview as SellSideListCandidate | undefined
      if (!response.ok || !parsedPreview) {
        setPreview(null)
        setError(data.error ?? 'Could not parse the candidate.')
        return
      }
      setPreview(parsedPreview)
      setValidationErrors(validateCandidate(parsedPreview))
    } finally {
      setIsParsing(false)
    }
  }

  const handleSave = async () => {
    if (!preview) return

    const errors = validateCandidate(preview)
    setValidationErrors(errors)
    if (errors.length > 0) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/sell-side-list-finder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...preview,
          year: preview.year ?? (formData.year ? Number(formData.year) : undefined),
          period: preview.period ?? formData.period,
          sourcePublisher: preview.sourcePublisher ?? formData.sourcePublisher,
          sourceUrl: preview.sourceUrl ?? formData.sourceUrl,
          sourceType: preview.sourceType ?? formData.sourceType,
          confidence: preview.confidence ?? formData.confidence,
          reviewStatus: 'needs_review',
        }),
      })
      const data = await response.json()
      setSaveResult(data)
      if (!response.ok || !data.success) {
        setError(data.errors?.[0] ?? 'Save failed.')
      }
    } catch {
      setError('Could not save the conviction list.')
    } finally {
      setIsSaving(false)
    }
  }

  const prefillFromPartialCandidate = (candidate: PartialCandidate) => {
    setFormData((current) => ({
      ...current,
      institution: candidate.institution,
      listName: candidate.listName,
      year: candidate.year?.toString() ?? '',
      period: candidate.period ?? '',
      theme: candidate.theme ?? '',
      sector: candidate.sector ?? '',
      sourceType: 'media_summary',
      confidence: 'needs_review',
      tickers: candidate.visibleTickers?.join(', ') ?? '',
    }))
    setPreview(null)
    setSaveResult(null)
    setValidationErrors([])
    setError(null)
    window.setTimeout(() => tickersRef.current?.focus(), 0)
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Sell-Side List Finder</h1>
        <Link href="/conviction-lists">
          <Button variant="outline">Back to Conviction Lists</Button>
        </Link>
      </div>

      {windowInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Search window</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Current search window: {windowInfo.from} → {windowInfo.to}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Query generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {groupedQueries.map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-semibold">{category}</h3>
              {items.map((query) => (
                <div key={`${query.bank}-${query.query}`} className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#1F1F1F] px-3 py-2 text-sm">
                  <span>{query.query}</span>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(query.query)}>Copy query</Button>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(query.query)}`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm">Open Google</Button>
                    </a>
                    <a href={`https://www.bing.com/search?q=${encodeURIComponent(query.query)}`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm">Open Bing</Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {saveResult && (
        <Alert variant={saveResult.success ? 'default' : 'destructive'}>
          <AlertTitle>{saveResult.success ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription className="space-y-2">
            <div>{saveResult.success ? 'Saved successfully.' : 'Save failed.'}</div>
            <div className="text-xs text-muted-foreground">
              Created: {saveResult.created}; Updated: {saveResult.updated}; Skipped: {saveResult.skipped}; Failed: {saveResult.failed}
            </div>
            {saveResult.errors?.length ? <div className="text-xs">{saveResult.errors.join(', ')}</div> : null}
            {saveResult.success && saveResult.url ? (
              <Link href={saveResult.url} className="underline">Open Conviction List</Link>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Candidate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Institution</label>
              <Input value={formData.institution} onChange={(event) => setFormData((current) => ({ ...current, institution: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">List name</label>
              <Input value={formData.listName} onChange={(event) => setFormData((current) => ({ ...current, listName: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Year</label>
              <Input value={formData.year} onChange={(event) => setFormData((current) => ({ ...current, year: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Period</label>
              <Input value={formData.period} onChange={(event) => setFormData((current) => ({ ...current, period: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Theme</label>
              <Input value={formData.theme} onChange={(event) => setFormData((current) => ({ ...current, theme: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sector</label>
              <Input value={formData.sector} onChange={(event) => setFormData((current) => ({ ...current, sector: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Region</label>
              <Input value={formData.region} onChange={(event) => setFormData((current) => ({ ...current, region: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Source publisher</label>
              <Input value={formData.sourcePublisher} onChange={(event) => setFormData((current) => ({ ...current, sourcePublisher: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Source URL</label>
              <Input value={formData.sourceUrl} onChange={(event) => setFormData((current) => ({ ...current, sourceUrl: event.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Source type</label>
              <Select value={formData.sourceType} onValueChange={(value) => setFormData((current) => ({ ...current, sourceType: value as SellSideFormState['sourceType'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="media_summary">media_summary</SelectItem>
                  <SelectItem value="official_page">official_page</SelectItem>
                  <SelectItem value="official_pdf">official_pdf</SelectItem>
                  <SelectItem value="manual">manual</SelectItem>
                  <SelectItem value="csv">csv</SelectItem>
                  <SelectItem value="paste">paste</SelectItem>
                  <SelectItem value="api">api</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Confidence</label>
              <Select value={formData.confidence} onValueChange={(value) => setFormData((current) => ({ ...current, confidence: value as SellSideFormState['confidence'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="needs_review">needs_review</SelectItem>
                  <SelectItem value="verified">verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Raw source title</label>
              <Input value={formData.rawSourceTitle} onChange={(event) => setFormData((current) => ({ ...current, rawSourceTitle: event.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Raw source excerpt</label>
              <Textarea value={formData.rawSourceExcerpt} onChange={(event) => setFormData((current) => ({ ...current, rawSourceExcerpt: event.target.value }))} rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Tickers / raw text</label>
              <Textarea ref={tickersRef} value={formData.tickers} onChange={(event) => setFormData((current) => ({ ...current, tickers: event.target.value }))} rows={6} placeholder="Bank of America flags five software stocks for H2 2026: Snowflake (SNOW), Datadog (DDOG), JFrog (FROG), MongoDB (MDB), Twilio (TWLO)." />
            </div>
          </div>

          {validationErrors.length > 0 ? (
            <div className="rounded border border-red-900 bg-red-950/40 p-3 text-sm">
              <p className="font-medium">Please fix the following before saving:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {validationErrors.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleParse} disabled={isParsing}>{isParsing ? 'Parsing…' : 'Parse & Preview'}</Button>
            <Button variant="outline" onClick={() => {
              setFormData(initialFormState)
              setPreview(null)
              setValidationErrors([])
              setSaveResult(null)
              setError(null)
            }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div><strong>Institution:</strong> {preview.institution}</div>
              <div><strong>List:</strong> {preview.listName}</div>
              <div><strong>Year / Period:</strong> {preview.year ?? '—'} / {preview.period ?? '—'}</div>
              <div><strong>Theme / Sector / Region:</strong> {preview.theme ?? '—'} / {preview.sector ?? '—'} / {preview.region ?? '—'}</div>
              <div><strong>Source publisher:</strong> {preview.sourcePublisher ?? '—'}</div>
              <div><strong>Source URL:</strong> {preview.sourceUrl ?? '—'}</div>
              <div><strong>Source type:</strong> {preview.sourceType}</div>
              <div><strong>Confidence:</strong> {preview.confidence}</div>
              <div><strong>Review status:</strong> {preview.reviewStatus ?? 'needs_review'}</div>
              <div><strong>Member count:</strong> {preview.members?.length ?? 0}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.members?.map((member, index) => (
                  <TableRow key={`${member.ticker}-${index}`}>
                    <TableCell>{member.rank ?? index + 1}</TableCell>
                    <TableCell>{member.ticker}</TableCell>
                    <TableCell>{member.companyName ?? '—'}</TableCell>
                    <TableCell>{member.action ?? 'unknown'}</TableCell>
                    <TableCell>{member.note ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save as Conviction List'}</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Partial Candidates (Needs Extraction)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {partialCandidates.map((candidate) => (
            <div key={`${candidate.institution}-${candidate.listName}`} className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1F1F1F] p-3 text-sm">
              <div>
                <p className="font-medium">{candidate.institution} — {candidate.listName}</p>
                <p className="text-xs text-muted-foreground">
                  Expected count: {candidate.expectedCount ?? 'n/a'} · Visible tickers: {candidate.visibleTickers?.join(', ') || 'n/a'} · Status: {candidate.reviewStatus}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${candidate.institution} ${candidate.listName} ${candidate.year ?? ''}`.trim())}>Copy search query</Button>
                <Button variant="ghost" size="sm" onClick={() => prefillFromPartialCandidate(candidate)}>Create from paste</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
