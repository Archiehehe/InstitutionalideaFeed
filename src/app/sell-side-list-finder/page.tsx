'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SellSideListFinderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sell-Side List Finder</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Search Window</CardTitle>
        </CardHeader>
        <CardContent>
          Dec 1, 2025 → today (Placeholder)
        </CardContent>
      </Card>
    </div>
  )
}
