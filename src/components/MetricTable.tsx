import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface MetricRow {
  label: string
  value: string | number | undefined | null
  format?: 'currency' | 'percent' | 'number'
}

function formatValue(value: string | number | undefined | null, format?: string) {
  if (value === undefined || value === null) return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return value
  switch (format) {
    case 'currency': return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    case 'percent': return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`
    default: return num.toLocaleString()
  }
}

export function MetricTable({ rows }: { rows: MetricRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/30">
          <TableHead className="w-1/3 text-muted-foreground/60">Metric</TableHead>
          <TableHead className="text-muted-foreground/60">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label} className="border-border/20 hover:bg-muted/20">
            <TableCell className="text-xs text-muted-foreground/70">{row.label}</TableCell>
            <TableCell className="text-xs font-mono text-foreground/80">{formatValue(row.value, row.format)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export type { MetricRow }
