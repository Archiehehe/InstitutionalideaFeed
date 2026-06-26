import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoreBreakdownProps {
  breakdown: Record<string, number>
  totalScore: number
}

export function ScoreBreakdown({ breakdown, totalScore }: ScoreBreakdownProps) {
  const rules = Object.entries(breakdown)

  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground/80">Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {rules.map(([rule, score]) => (
            <div key={rule} className="flex justify-between text-xs">
              <span className="text-muted-foreground/70">{rule}</span>
              <span className={score >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {score >= 0 ? `+${score}` : score}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border/40">
            <span className="text-foreground/80">Total</span>
            <span className="text-primary drop-shadow-[0_0_6px_oklch(0.65_0.18_250/0.3)]">{totalScore}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
