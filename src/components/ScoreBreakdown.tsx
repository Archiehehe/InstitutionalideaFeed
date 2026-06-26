import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoreBreakdownProps {
  breakdown: Record<string, number>
  totalScore: number
}

export function ScoreBreakdown({ breakdown, totalScore }: ScoreBreakdownProps) {
  const rules = Object.entries(breakdown)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {rules.map(([rule, score]) => (
            <div key={rule} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{rule}</span>
              <span className={score >= 0 ? 'text-green-600' : 'text-red-500'}>
                {score >= 0 ? `+${score}` : score}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{totalScore}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
