import { getStore } from '@/lib/storage'

export function generateDuplicateKey(url: string, title: string): string {
  const urlKey = url.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase()
  const titleKey = title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 100)
  return `${urlKey}::${titleKey}`
}

export async function isDuplicate(key: string): Promise<boolean> {
  const store = getStore()
  const articles = await store.getArticles()
  return articles.some(a => a.duplicateKey === key)
}
