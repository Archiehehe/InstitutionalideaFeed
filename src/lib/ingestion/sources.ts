import { getStore } from '@/lib/storage'

export async function getEnabledSources() {
  const store = getStore()
  const sources = await store.getSources()
  const tierOrder = { core: 0, secondary: 1, archive: 2 }
  return sources
    .filter((source) => source.enabled)
    .filter((source) => ['primary_institutional', 'public_institutional_research', 'manual'].includes(source.sourceClass ?? 'primary_institutional'))
    .sort((a, b) => (
      (tierOrder[a.sourceTier ?? 'secondary'] ?? 1) - (tierOrder[b.sourceTier ?? 'secondary'] ?? 1) ||
      a.name.localeCompare(b.name)
    ))
}
