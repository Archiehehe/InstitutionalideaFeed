import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardContent className="flex items-center gap-3 py-4">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      </CardContent>
    </Card>
  )
}
