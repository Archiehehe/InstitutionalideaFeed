import { Badge } from '@/components/ui/badge'

const FIRM_COLORS: Record<string, string> = {
  'Goldman Sachs': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Morgan Stanley': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Bank of America': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'JPMorgan': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Citi': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'UBS': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Jefferies': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Evercore': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

export function FirmBadge({ firm }: { firm: string }) {
  const colorClass = FIRM_COLORS[firm] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  return (
    <Badge className={`${colorClass} border-0 font-medium`} variant="secondary">
      {firm}
    </Badge>
  )
}
