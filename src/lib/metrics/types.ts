import type { MetricsSnapshot } from '@/lib/storage/types'

export interface MetricsProvider {
  name: string
  getSnapshot(ticker: string): Promise<Partial<MetricsSnapshot> | null>
}

export interface MergedMetrics {
  ticker: string
  provider: string
  price?: number
  marketCap?: number
  analystRating?: string
  avgPriceTarget?: number
  impliedUpside?: number
  athPrice?: number
  distanceFromAth?: number
  high52Week?: number
  low52Week?: number
  revenueGrowth?: number
  valuationJson?: Record<string, unknown>
  earningsDate?: string
  insiderActivityJson?: Record<string, unknown>
  rawJson?: Record<string, unknown>
  cached: boolean
  cacheDate?: string
}
