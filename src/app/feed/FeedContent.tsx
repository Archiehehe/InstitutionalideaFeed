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
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSnapJudgementUrl } from '@/lib/integrations/snapJudgement'

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
  const [submitMessage, setSubmitMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchArticles() }, [fetchArticles])

  const uniqueFirms = [...new Set(articles.map(a => a.firm).filter(Boolean) as string[])]
  const uniqueSectors = [...new Set(articles.map(a => a.sector).filter(Boolean) as string[])]
  const uniqueRegions = [...new Set(articles.map(a => a.region).filter(Boolean) as string[])]

  const handleSubmitUrl = async () => {
    if (!submitUrl) return
    setSubmitStatus('loading')
    setSubmitMessage('')
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submitUrl }),
      })
      const data = await res.json()
      if (res.status === 201) {
        setSubmitStatus('done')
        setSubmitMessage(`Article saved! Score: ${data.score}`)
        setSubmitUrl('')
        setTimeout(() => { setDialogOpen(false); setSubmitMessage(''); setSubmitStatus('idle') }, 1500)
        fetchArticles()
      } else if (res.status === 409) {
        setSubmitStatus('error')
        setSubmitMessage('Article already exists (duplicate).')
      } else if (res.status === 422) {
        setSubmitStatus('error')
        setSubmitMessage(`Score ${data.score} is below the feed threshold. Breakdown: ${JSON.stringify(data.breakdown)}`)
      } else {
        setSubmitStatus('error')
        setSubmitMessage(data.error || 'Failed to submit article.')
      }
    } catch {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Could not reach the server.')
    }
  }

  const handleFeedback = async (articleId: string, action: string) => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, action }),
    })
  }

  const handleAnalyze = (article: ArticleData) => {
    window.open(getSnapJudgementUrl(article.tickers), '_blank', 'noopener,noreferrer')
  }

  const handleSaveBasket = async (article: ArticleData) => {
    const name = [article.firm, article.theme, 'Basket'].filter(Boolean).join(' ') || `Basket from ${article.title.slice(0, 40)}`
    await fetch('/api/baskets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        articleId: article.id,
        firm: article.firm,
        theme: article.theme,
        sector: article.sector,
        region: article.region,
        tickers: article.tickers,
      }),
    })
    handleFeedback(article.id, 'save_basket')
  }

  if (error) return <ErrorState message={error} />
  if (loading) return <LoadingState />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Feed</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setSubmitStatus('idle'); setSubmitMessage(''); setSubmitUrl('') }}}>
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
            {submitMessage && (
              <p className={`text-xs mt-1 ${submitStatus === 'done' ? 'text-green-600' : 'text-red-500'}`}>
                {submitMessage}
              </p>
            )}
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
          title="No institutional ideas yet"
          description="Add a source or submit a research/media URL to start building your feed."
          actions={[
            { label: 'Submit URL', onClick: () => setDialogOpen(true) },
            { label: 'Go to Sources', onClick: () => router.push('/sources') },
          ]}
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
              onSaveBasket={() => handleSaveBasket(a)}
              onRunMetrics={() => router.push(`/article/${a.id}`)}
              onAddAllToWatchlist={async () => {
                for (const t of a.tickers) {
                  await fetch('/api/watchlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticker: t }),
                  })
                }
              }}
              onAnalyze={() => handleAnalyze(a)}
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
