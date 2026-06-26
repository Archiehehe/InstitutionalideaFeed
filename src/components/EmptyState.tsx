'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

export function EmptyState({ title, description, actions }: { title: string; description?: string; actions?: EmptyStateAction[] }) {
  return (
    <Card className="border-dashed border-border/30 bg-card/40">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground/20 mb-3" />
        <p className="text-sm font-medium text-muted-foreground/60">{title}</p>
        {description && <p className="text-xs text-muted-foreground/40 mt-1 max-w-sm">{description}</p>}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {actions.map((a) => (
              <Button key={a.label} variant="outline" size="sm" onClick={a.onClick}>
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
