import { Badge } from '@/components/ui/badge'

export function TickerPill({ ticker, onClick }: { ticker: string; onClick?: () => void }) {
  return (
    <Badge
      variant="outline"
      className="cursor-pointer font-mono text-xs font-medium tracking-tight px-2 py-0.5 rounded-full border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
      onClick={onClick}
    >
      {ticker}
    </Badge>
  )
}
