'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArticleCard } from '@/components/ArticleCard'
import { FilterBar } from '@/components/FilterBar'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, ExternalLink } from 'lucide-react'

interface ArticleData {
  id: string
  title: string
  sourceName: string
  sourceType: string
  firm?: string
  publishedAt: string
  theme?: string
  sector?: string
  region?: string
  tickers: string[]
  score: number
  reasonShown?: string
}

export function FeedPage() {
  const [articles, setArticles] = useState<ArticleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [firmFilter, setFirmFilter] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [submitUrl, setSubmitUrl] = useState('')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (firmFilter) params.set('firm', firmFilter)
      if (sectorFilter) params.set('sector', sectorFilter)
      if (regionFilter) params.set('region', regionFilter)

      const res = await fetch(`/api/articles?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setArticles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }, [search, firmFilter, sectorFilter, regionFilter])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const uniqueFirms = [...new Set(articles.map(a => a.firm).filter(Boolean) as string[])]
  const uniqueSectors = [...new Set(articles.map(a => a.sector).filter(Boolean) as string[])]
  const uniqueRegions = [...new Set(articles.map(a => a.region).filter(Boolean) as string[])]

  const handleSubmitUrl = async () => {
    if (!submitUrl) return
    setSubmitStatus('loading')
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submitUrl }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitStatus('done')
      setSubmitUrl('')
      fetchArticles()
    } catch {
      setSubmitStatus('error')
    }
  }

  const handleFeedback = async (articleId: string, action: string) => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, action }),
    })
  }

  if (error) return <ErrorState message={error} />
  if (loading) return <LoadingState />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Feed</h1>
        <Dialog>
          <DialogTrigger>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" /> Submit URL
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Article URL</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                value={submitUrl}
                onChange={(e) => setSubmitUrl(e.target.value)}
              />
              <Button onClick={handleSubmitUrl} disabled={submitStatus === 'loading'}>
                {submitStatus === 'loading' ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
            {submitStatus === 'done' && <p className="text-xs text-green-600">Article submitted!</p>}
            {submitStatus === 'error' && <p className="text-xs text-red-500">Failed to submit</p>}
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar
        firms={uniqueFirms}
        sectors={uniqueSectors}
        regions={uniqueRegions}
        selectedFirm={firmFilter}
        selectedSector={sectorFilter}
        selectedRegion={regionFilter}
        searchQuery={search}
        onFirmChange={setFirmFilter}
        onSectorChange={setSectorFilter}
        onRegionChange={setRegionFilter}
        onSearchChange={setSearch}
      />

      {articles.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Submit a URL or run a scan to populate the feed"
        />
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              id={a.id}
              title={a.title}
              source={a.sourceName}
              firm={a.firm}
              sourceType={a.sourceType}
              publishedAt={a.publishedAt}
              theme={a.theme}
              sector={a.sector}
              region={a.region}
              tickers={a.tickers}
              score={a.score}
              reasonShown={a.reasonShown}
              onSaveBasket={() => handleFeedback(a.id, 'save_basket')}
              onRunMetrics={() => {}}
              onAddAllToWatchlist={() => {}}
              onMoreLikeThis={() => handleFeedback(a.id, 'more_like_this')}
              onLessLikeThis={() => handleFeedback(a.id, 'less_like_this')}
              onHideSource={() => handleFeedback(a.id, 'hide_source')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
