'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FirmBadge } from '@/components/FirmBadge'
import { ThemeBadge, SectorBadge, RegionBadge, SourceTypeBadge } from '@/components/ThemeBadge'
import { ScoreBadge } from '@/components/ScoreBadge'
import { TickerPill } from '@/components/TickerPill'
import { Eye, Plus, TrendingUp, BarChart3, ThumbsUp, ThumbsDown, EyeOff } from 'lucide-react'

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
  onMoreLikeThis,
  onLessLikeThis,
  onHideSource,
}: ArticleCardProps) {
  const date = new Date(publishedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <a
              href={`/article/${id}`}
              className="hover:underline decoration-muted-foreground/30 underline-offset-2"
            >
              <CardTitle className="text-sm leading-snug line-clamp-2">
                {title}
              </CardTitle>
            </a>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {firm && <FirmBadge firm={firm} />}
              <SourceTypeBadge type={sourceType} />
              {theme && <ThemeBadge theme={theme} />}
              {sector && <SectorBadge sector={sector} />}
              {region && <RegionBadge region={region} />}
            </div>
          </div>
          <ScoreBadge score={score} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{source}</span>
          <span>·</span>
          <span>{date}</span>
        </div>

        {tickers.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tickers.map((t) => (
              <TickerPill key={t} ticker={t} />
            ))}
          </div>
        )}

        {reasonShown && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-1 italic">
            Why: {reasonShown}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1 mt-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onSaveBasket}>
            <Plus className="h-3 w-3" /> Basket
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onRunMetrics}>
            <TrendingUp className="h-3 w-3" /> Metrics
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onAddAllToWatchlist}>
            <Eye className="h-3 w-3" /> Watchlist
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onMoreLikeThis}>
            <ThumbsUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onLessLikeThis}>
            <ThumbsDown className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onHideSource}>
            <EyeOff className="h-3 w-3" />
          </Button>
          <a href={`/article/${id}`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 ml-auto">
              <BarChart3 className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
