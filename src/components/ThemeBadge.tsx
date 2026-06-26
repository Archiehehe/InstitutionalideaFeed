import { Badge } from '@/components/ui/badge'

export function ThemeBadge({ theme }: { theme: string }) {
  return (
    <Badge variant="secondary" className="text-[11px] bg-cyan-50 text-cyan-700 border-cyan-200 font-medium px-1.5 py-0.5">
      {theme}
    </Badge>
  )
}

export function SectorBadge({ sector }: { sector: string }) {
  return (
    <Badge variant="outline" className="text-[11px] text-slate-500 border-slate-200 font-medium px-1.5 py-0.5">
      {sector}
    </Badge>
  )
}

export function RegionBadge({ region }: { region: string }) {
  return (
    <Badge variant="outline" className="text-[11px] border-blue-200 text-blue-600 font-medium px-1.5 py-0.5">
      {region}
    </Badge>
  )
}

export function SourceTypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    media: 'bg-amber-50 text-amber-700 border-amber-200',
    newsletter: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    manual: 'bg-slate-50 text-slate-500 border-slate-200',
  }
  return (
    <Badge className={`${colorMap[type] || 'bg-slate-50 text-slate-500 border-slate-200'} border text-[11px] capitalize font-medium px-1.5 py-0.5`} variant="outline">
      {type}
    </Badge>
  )
}
