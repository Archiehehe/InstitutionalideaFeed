'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingState } from '@/components/LoadingState'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SellSideListFinderPage() {
  const [windowInfo, setWindowInfo] = useState<{ from: string; to: string } | null>(null)
  const [queries, setQueries] = useState<any[]>([])
  const [partialCandidates, setPartialCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
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
    tickers: ''
  })
  const [preview, setPreview] = useState<any | null>(null)
  const [saveResult, setSaveResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
        fetch('/api/sell-side-list-finder/queries').then(res => res.json()),
        fetch('/api/sell-side-list-finder/partial-candidates').then(res => res.json())
    ]).then(([queriesData, partialData]) => {
        setWindowInfo({
            from: new Date(queriesData.window.fromDate).toLocaleDateString(),
            to: new Date(queriesData.window.toDate).toLocaleDateString()
        })
        setQueries(queriesData.queries)
        setPartialCandidates(partialData)
        setLoading(false)
    })
  }, [])

  const handleParse = async () => {
    setError(null)
    const res = await fetch('/api/sell-side-list-finder/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${formData.institution} ${formData.listName}\n${formData.tickers}` })
    })
    const data = await res.json()
    setPreview(data)
  }

  const handleSave = async () => {
    if (!preview) return
    const res = await fetch('/api/sell-side-list-finder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData, ...preview, reviewStatus: 'needs_review'})
    })
    const data = await res.json()
    setSaveResult(data)
    setPreview(null)
  }

  const prefill = (candidate: any) => {
    setFormData(prev => ({
        ...prev,
        institution: candidate.institution,
        listName: candidate.listName,
        tickers: candidate.visibleTickers?.join(', ') || ''
    }))
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sell-Side List Finder</h1>
        <Link href="/conviction-lists">
            <Button variant="outline">Back to Conviction Lists</Button>
        </Link>
      </div>

      {saveResult && (
        <Alert variant={saveResult.success ? 'default' : 'destructive'}>
            <AlertTitle>{saveResult.success ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>
                {saveResult.success ? 'Saved successfully.' : 'Save failed.'}
                {saveResult.success && <Link href={`/conviction-lists/${saveResult.listId}`} className="underline ml-2">Open Conviction List</Link>}
            </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Add Candidate</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Institution" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} />
                <Input placeholder="List Name" value={formData.listName} onChange={e => setFormData({...formData, listName: e.target.value})} />
                <Input placeholder="Year" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                <Input placeholder="Period" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
            </div>
            <Textarea placeholder="Tickers or Raw Text" value={formData.tickers} onChange={e => setFormData({...formData, tickers: e.target.value})} />
            <Button onClick={handleParse}>Parse & Preview</Button>
        </CardContent>
      </Card>

      {preview && (
        <Card>
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div><strong>Institution:</strong> {preview.institution}</div>
                    <div><strong>List:</strong> {preview.listName}</div>
                    <div><strong>Members:</strong> {preview.members?.length}</div>
                </div>
                <Table>
                    <TableHeader><TableRow><TableHead>Ticker</TableHead><TableHead>Company</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {preview.members?.map((m: any, i: number) => <TableRow key={i}><TableCell>{m.ticker}</TableCell><TableCell>{m.companyName}</TableCell></TableRow>)}
                    </TableBody>
                </Table>
                <Button className="mt-4" onClick={handleSave}>Save as Conviction List</Button>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Partial Candidates (Needs Extraction)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
            {partialCandidates.map((c: any, i: number) => (
                <div key={i} className="flex justify-between border-b p-2">
                    <span className="text-sm">{c.institution} - {c.listName}</span>
                    <Button variant="ghost" size="sm" onClick={() => prefill(c)}>Create from paste</Button>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
