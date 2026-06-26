'use client'

import { useEffect, useState } from 'react'
import { BasketCard } from '@/components/BasketCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'

interface BasketData {
  id: string
  name: string
  firm?: string
  theme?: string
  sector?: string
  region?: string
  tickers: string[]
  createdAt: string
}

export default function BasketsPage() {
  const [baskets, setBaskets] = useState<BasketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBaskets = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/baskets')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setBaskets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBaskets() }, [])

  const handleDelete = async (id: string) => {
    await fetch(`/api/baskets/${id}`, { method: 'DELETE' })
    fetchBaskets()
  }

  const handleExportCsv = (basket: BasketData) => {
    const csv = `Ticker\n${basket.tickers.join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${basket.name}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (error) return <ErrorState message={error} />
  if (loading) return <LoadingState />

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Baskets</h1>
      {baskets.length === 0 ? (
        <EmptyState title="No baskets yet" description="Save a basket from the feed to get started" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {baskets.map((b) => (
            <BasketCard
              key={b.id}
              {...b}
              onRunMetrics={() => fetch(`/api/baskets/${b.id}/run-metrics`, { method: 'POST' })}
              onAddAllToWatchlist={() => {}}
              onExportCsv={() => handleExportCsv(b)}
              onDelete={() => handleDelete(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
