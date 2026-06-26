'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FirmBadge } from '@/components/FirmBadge'
import { ThemeBadge, SectorBadge, RegionBadge } from '@/components/ThemeBadge'
import { TickerPill } from '@/components/TickerPill'
import { TrendingUp, Eye, Download, Trash2, Zap } from 'lucide-react'

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
  onAnalyze?: () => void
  onExportCsv?: () => void
  onDelete?: () => void
}

export function BasketCard({
  name,
  firm,
  theme,
  sector,
  region,
  tickers,
  createdAt,
  onRunMetrics,
  onAddAllToWatchlist,
  onAnalyze,
  onExportCsv,
  onDelete,
}: BasketCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <Card className="border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-colors shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">{name}</h3>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {firm && <FirmBadge firm={firm} />}
              {theme && <ThemeBadge theme={theme} />}
              {sector && <SectorBadge sector={sector} />}
              {region && <RegionBadge region={region} />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#64748B] mt-2 mb-2">
          <span>Created {date}</span>
          <span className="text-[#CBD5E1]">·</span>
          <span>{tickers.length} stocks</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {tickers.map((t) => (
            <TickerPill key={t} ticker={t} />
          ))}
        </div>

        <div className="flex flex-wrap gap-1 pt-1 border-t border-[#F1F5F9]">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onRunMetrics}>
            <TrendingUp className="h-3 w-3" /> Metrics
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onAddAllToWatchlist}>
            <Eye className="h-3 w-3" /> Watchlist
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onAnalyze}>
            <Zap className="h-3 w-3" /> Analyze
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onExportCsv}>
            <Download className="h-3 w-3" /> CSV
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2]" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
