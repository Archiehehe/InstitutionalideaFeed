'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FirmBadge } from '@/components/FirmBadge'
import { ThemeBadge, SectorBadge, RegionBadge, SourceTypeBadge } from '@/components/ThemeBadge'
import { ScoreBadge } from '@/components/ScoreBadge'
import { TickerPill } from '@/components/TickerPill'
import { Eye, Plus, TrendingUp, BarChart3, ThumbsUp, ThumbsDown, EyeOff, Zap } from 'lucide-react'

interface ArticleCardProps {
  id: string
  title: string
  source: string
  firm?: string
  sourceType: string
  publishedAt: string
  theme?: string
  sector?: string
  region?: string
  tickers: string[]
  score: number
  reasonShown?: string
  onSaveBasket?: () => void
  onRunMetrics?: () => void
  onAddAllToWatchlist?: () => void
  onAnalyze?: () => void
  onMoreLikeThis?: () => void
  onLessLikeThis?: () => void
  onHideSource?: () => void
}

export function ArticleCard({
  id,
  title,
  source,
  firm,
  sourceType,
  publishedAt,
  theme,
  sector,
  region,
  tickers,
  score,
  reasonShown,
  onSaveBasket,
  onRunMetrics,
  onAddAllToWatchlist,
  onAnalyze,
  onMoreLikeThis,
  onLessLikeThis,
  onHideSource,
}: ArticleCardProps) {
  const date = new Date(publishedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <Card className="border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-colors shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <a
            href={`/article/${id}`}
            className="text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] leading-snug line-clamp-2 transition-colors flex-1 min-w-0"
          >
            {title}
          </a>
          <ScoreBadge score={score} />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2">
          <span className="font-medium text-[#475569]">{source}</span>
          {firm && (
            <>
              <span className="text-[#CBD5E1]">·</span>
              <span>{firm}</span>
            </>
          )}
          <span className="text-[#CBD5E1]">·</span>
          <span>{date}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1 mb-2">
          {firm && <FirmBadge firm={firm} />}
          <SourceTypeBadge type={sourceType} />
          {theme && <ThemeBadge theme={theme} />}
          {sector && <SectorBadge sector={sector} />}
          {region && <RegionBadge region={region} />}
        </div>

        {tickers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tickers.map((t) => (
              <TickerPill key={t} ticker={t} />
            ))}
          </div>
        )}

        {reasonShown && (
          <p className="text-[11px] text-[#94A3B8] italic mb-3 leading-relaxed">
            Why: {reasonShown}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-[#F1F5F9]">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onSaveBasket}>
            <Plus className="h-3 w-3" /> Basket
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onRunMetrics}>
            <TrendingUp className="h-3 w-3" /> Metrics
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onAddAllToWatchlist}>
            <Eye className="h-3 w-3" /> Watchlist
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onAnalyze}>
            <Zap className="h-3 w-3" /> Analyze
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onMoreLikeThis}>
            <ThumbsUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onLessLikeThis}>
            <ThumbsDown className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]" onClick={onHideSource}>
            <EyeOff className="h-3 w-3" />
          </Button>
          <a href={`/article/${id}`} className="ml-auto">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]">
              <BarChart3 className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
