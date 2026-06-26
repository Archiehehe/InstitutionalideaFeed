'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProviderStatus } from '@/components/ProviderStatus'
import { LoadingState } from '@/components/LoadingState'

const PROVIDER_VARS = [
  { name: 'FMP API', envVar: 'FMP_API_KEY' },
  { name: 'Finnhub', envVar: 'FINNHUB_API_KEY' },
  { name: 'Twelve Data', envVar: 'TWELVE_DATA_API_KEY' },
  { name: 'Alpha Vantage', envVar: 'ALPHA_VANTAGE_API_KEY' },
  { name: 'FRED', envVar: 'FRED_API_KEY' },
  { name: 'SEC API', envVar: 'SECAPI_KEY' },
  { name: 'SimFin', envVar: 'SIMFIN_API_KEY' },
  { name: 'Form4', envVar: 'FORM4_API_KEY' },
  { name: 'SentiSense', envVar: 'SENTISENSE_API_KEY' },
  { name: 'API Ninjas', envVar: 'API_NINJAS_KEY' },
  { name: 'Earnings API', envVar: 'EARNINGS_API_KEY' },
  { name: 'Supabase URL', envVar: 'SUPABASE_URL' },
]

export default function SettingsPage() {
  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkProviders = async () => {
      const status: Record<string, boolean> = {}
      for (const p of PROVIDER_VARS) {
        const res = await fetch(`/api/settings/check-env?name=${p.envVar}`)
        const data = await res.json()
        status[p.name] = data.configured
      }
      setProviderStatus(status)
      setLoading(false)
    }
    checkProviders()
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-lg font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Provider Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {PROVIDER_VARS.map((p) => (
              <ProviderStatus key={p.name} name={p.name} configured={providerStatus[p.name] || false} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {providerStatus['Supabase URL'] ? 'Using Supabase (production)' : 'Using JSON file store (development)'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">About</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>Institutional Idea Feed — MVP</p>
          <p>Extracts screenable stock baskets from institutional research and financial media.</p>
          <p>Score threshold: 8+</p>
          <p>Data sources: 20 curated sources</p>
        </CardContent>
      </Card>
    </div>
  )
}
