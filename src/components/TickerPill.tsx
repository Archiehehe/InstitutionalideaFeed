import { Badge } from '@/components/ui/badge'

export function TickerPill({ ticker, onClick }: { ticker: string; onClick?: () => void }) {
  return (
    <Badge
      variant="outline"
      className="cursor-pointer font-mono text-xs hover:bg-muted transition-colors"
      onClick={onClick}
    >
      {ticker}
    </Badge>
  )
}
