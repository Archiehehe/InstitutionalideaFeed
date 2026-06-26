import { Badge } from '@/components/ui/badge'

export function ScoreBadge({ score }: { score: number }) {
  let color: string
  if (score >= 14) color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  else if (score >= 10) color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  else if (score >= 8) color = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
  else color = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'

  return (
    <Badge className={`${color} border-0 font-mono text-xs`} variant="secondary">
      {score}
    </Badge>
  )
}
