import { Badge } from '@/components/ui/badge'

export function ThemeBadge({ theme }: { theme: string }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {theme}
    </Badge>
  )
}

export function SectorBadge({ sector }: { sector: string }) {
  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      {sector}
    </Badge>
  )
}

export function RegionBadge({ region }: { region: string }) {
  return (
    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
      {region}
    </Badge>
  )
}

export function SourceTypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
    media: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    newsletter: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
    manual: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  }
  return (
    <Badge className={`${colorMap[type] || 'bg-gray-100 text-gray-700'} border-0 text-xs capitalize`}>
      {type}
    </Badge>
  )
}
