'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FirmBadge } from '@/components/FirmBadge'
import { ThemeBadge, SectorBadge, RegionBadge } from '@/components/ThemeBadge'
import { TickerPill } from '@/components/TickerPill'
import { TrendingUp, Eye, Download, Trash2 } from 'lucide-react'

interface BasketCardProps {
  id: string
  name: string
  firm?: string
  theme?: string
  sector?: string
  region?: string
  tickers: string[]
  createdAt: string
  metricsStatus?: string
  onRunMetrics?: () => void
  onAddAllToWatchlist?: () => void
  onExportCsv?: () => void
  onDelete?: () => void
}

export function BasketCard({
  id: _id,
  name,
  firm,
  theme,
  sector,
  region,
  tickers,
  createdAt,
  onRunMetrics,
  onAddAllToWatchlist,
  onExportCsv,
  onDelete,
}: BasketCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">{name}</CardTitle>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {firm && <FirmBadge firm={firm} />}
              {theme && <ThemeBadge theme={theme} />}
              {sector && <SectorBadge sector={sector} />}
              {region && <RegionBadge region={region} />}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">Created {date} · {tickers.length} stocks</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {tickers.map((t) => (
            <TickerPill key={t} ticker={t} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onRunMetrics}>
            <TrendingUp className="h-3 w-3" /> Metrics
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onAddAllToWatchlist}>
            <Eye className="h-3 w-3" /> Watchlist
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onExportCsv}>
            <Download className="h-3 w-3" /> CSV
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-500 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
