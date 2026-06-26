import { Badge } from '@/components/ui/badge'

export function ScoreBadge({ score }: { score: number }) {
  let color: string
  if (score >= 15) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  } else if (score >= 10) {
    color = 'bg-blue-50 text-blue-700 border-blue-200'
  } else if (score >= 7) {
    color = 'bg-amber-50 text-amber-700 border-amber-200'
  } else {
    color = 'bg-slate-50 text-slate-400 border-slate-200'
  }

  return (
    <Badge className={`${color} border font-mono text-xs font-semibold px-2 py-0.5`} variant="outline">
      {score}
    </Badge>
  )
}
