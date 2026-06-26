import type { MetricsSnapshot } from '@/lib/storage/types'
import { getStore } from '@/lib/storage'

export const TTL = {
  PRICE: 24 * 60 * 60 * 1000,
  ANALYST: 7 * 24 * 60 * 60 * 1000,
  FUNDAMENTALS: 90 * 24 * 60 * 60 * 1000,
  ATH: 7 * 24 * 60 * 60 * 1000,
  INSIDER: 24 * 60 * 60 * 1000,
  EARNINGS: 24 * 60 * 60 * 1000,
}

export async function getCachedMetrics(ticker: string, maxAge = TTL.PRICE) {
  const store = getStore()
  const snapshot = await store.getMetricsSnapshot(ticker)
  if (!snapshot) return null

  const age = Date.now() - new Date(snapshot.snapshotDate).getTime()
  if (age > maxAge) return null

  return snapshot
}

export async function cacheMetrics(
  ticker: string,
  provider: string,
  data: Partial<Omit<MetricsSnapshot, 'id' | 'createdAt' | 'ticker' | 'provider' | 'snapshotDate'>>,
) {
  const store = getStore()
  return store.saveMetricsSnapshot({
    ticker: ticker.toUpperCase(),
    provider,
    snapshotDate: new Date().toISOString(),
    ...data,
  })
}
