import { getStore } from '@/lib/storage'

export async function getEnabledSources() {
  const store = getStore()
  const sources = await store.getSources()
  return sources.filter(s => s.enabled)
}
