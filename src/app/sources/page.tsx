'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { Plus, Play } from 'lucide-react'

interface SourceItem {
  id: string
  name: string
  domain: string
  sourceType: string
  rssUrl?: string
  parserType?: string
  enabled: boolean
  qualityScore: number
  notes?: string
}

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newSource, setNewSource] = useState({ name: '', domain: '', sourceType: 'media', rssUrl: '', parserType: 'generic', enabled: true, qualityScore: 5 })
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchSources = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/sources')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSources(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSources() }, [])

  const handleToggle = async (id: string, enabled: boolean) => {
    await fetch(`/api/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })
    fetchSources()
  }

  const handleAdd = async () => {
    await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSource),
    })
    setDialogOpen(false)
    setNewSource({ name: '', domain: '', sourceType: 'media', rssUrl: '', parserType: 'generic', enabled: true, qualityScore: 5 })
    fetchSources()
  }

  const handleTestSource = async (id: string) => {
    await fetch('/api/scan/source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId: id }),
    })
  }

  if (error) return <ErrorState message={error} />
  if (loading) return <LoadingState />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Sources</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" /> Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <Input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Domain</label>
                <Input value={newSource.domain} onChange={(e) => setNewSource({ ...newSource, domain: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Type</label>
                <Select value={newSource.sourceType} onValueChange={(v) => setNewSource({ ...newSource, sourceType: v ?? 'media' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">RSS URL (optional)</label>
                <Input value={newSource.rssUrl} onChange={(e) => setNewSource({ ...newSource, rssUrl: e.target.value })} />
              </div>
              <Button onClick={handleAdd}>Add Source</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sources.length === 0 ? (
        <EmptyState title="No sources configured" description="Add sources to start ingesting articles" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.domain}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">{s.sourceType}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{s.qualityScore}/10</TableCell>
                  <TableCell>
                    <Switch checked={s.enabled} onCheckedChange={(v) => handleToggle(s.id, v)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleTestSource(s.id)}>
                      <Play className="h-3 w-3" /> Test
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
