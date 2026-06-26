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
  const [sourceCount, setSourceCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      const status: Record<string, boolean> = {}
      for (const p of PROVIDER_VARS) {
        const res = await fetch(`/api/settings/check-env?name=${p.envVar}`)
        const data = await res.json()
        status[p.name] = data.configured
      }

      let sc = 0
      try {
        const srcRes = await fetch('/api/sources')
        if (srcRes.ok) {
          const data = await srcRes.json()
          sc = data.length
        }
      } catch {}

      setProviderStatus(status)
      setSourceCount(sc)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState />

  const configuredCount = Object.values(providerStatus).filter(Boolean).length
  const isSupabase = providerStatus['Supabase URL']

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-lg font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Setup Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Supabase connected</span>
            <Badge variant={isSupabase ? 'outline' : 'destructive'} className="text-xs">
              {isSupabase ? 'Connected' : 'Not configured'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">CRON_SECRET set</span>
            <Badge variant={providerStatus['CRON_SECRET'] ? 'outline' : 'destructive'} className="text-xs">
              {providerStatus['CRON_SECRET'] ? 'Configured' : 'Not set'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Finance APIs configured</span>
            <Badge variant="outline" className="text-xs">
              {configuredCount - (isSupabase ? 1 : 0)} / {PROVIDER_VARS.length - 1}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Sources configured</span>
            <Badge variant="outline" className="text-xs">
              {sourceCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Storage mode</span>
            <Badge variant="outline" className="text-xs">
              {isSupabase ? 'Supabase (production)' : 'Local file (development)'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">SnapJudgement integration</span>
            <Badge variant={process.env.NEXT_PUBLIC_SNAPJUDGEMENT_URL ? 'outline' : 'destructive'} className="text-xs">
              {process.env.NEXT_PUBLIC_SNAPJUDGEMENT_URL ? 'Configured' : 'Not configured'}
            </Badge>
          </div>
        </CardContent>
      </Card>

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
          <CardTitle className="text-sm">About</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>Institutional Idea Feed</p>
          <p>Extracts screenable stock baskets from institutional research and financial media.</p>
          <p>Score threshold: 8+</p>
        </CardContent>
      </Card>
    </div>
  )
}
