import { Badge } from '@/components/ui/badge'

const FIRM_COLORS: Record<string, string> = {
  'Goldman Sachs': 'bg-blue-50 text-blue-700 border-blue-200',
  'Morgan Stanley': 'bg-sky-50 text-sky-700 border-sky-200',
  'Bank of America': 'bg-red-50 text-red-700 border-red-200',
  'JPMorgan': 'bg-purple-50 text-purple-700 border-purple-200',
  'Citi': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'UBS': 'bg-orange-50 text-orange-700 border-orange-200',
  'Jefferies': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Evercore': 'bg-pink-50 text-pink-700 border-pink-200',
}

export function FirmBadge({ firm }: { firm: string }) {
  const colorClass = FIRM_COLORS[firm] || 'bg-amber-50 text-amber-700 border-amber-200'
  return (
    <Badge className={`${colorClass} border text-[11px] font-medium px-1.5 py-0.5`} variant="outline">
      {firm}
    </Badge>
  )
}
