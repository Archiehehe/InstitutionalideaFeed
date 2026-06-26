import { createClient } from '@supabase/supabase-js'
import type { Store } from './types'

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set')
  }
  return createClient(url, key)
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function mapKeysToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[toSnakeCase(key)] = value
    }
  }
  return result
}

function mapKeysToCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[toCamelCase(key)] = value
  }
  return result as T
}

function mapArrayToCamel<T>(arr: Record<string, unknown>[]): T[] {
  return arr.map(item => mapKeysToCamel<T>(item))
}

export function createSupabaseStore(): Store {
  const store: Store = {
    async getSources() {
      const { data } = await getClient().from('sources').select('*').order('name')
      return data ? mapArrayToCamel(data) : []
    },
    async getSource(id: string) {
      const { data } = await getClient().from('sources').select('*').eq('id', id).single()
      return data ? mapKeysToCamel(data) : null
    },
    async createSource(input) {
      const { data } = await getClient().from('sources').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },
    async updateSource(id, updates) {
      const { data } = await getClient().from('sources').update(mapKeysToSnake(updates as Record<string, unknown>)).eq('id', id).select().single()
      return data ? mapKeysToCamel(data) : null
    },
    async deleteSource(id) {
      const { count } = await getClient().from('sources').delete().eq('id', id)
      return (count ?? 0) > 0
    },

    async getArticles(filters) {
      let query = getClient().from('articles').select('*').order('published_at', { ascending: false })
      if (filters?.minScore !== undefined) {
        query = query.gte('article_score', filters.minScore)
      }
      if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1)
      if (filters?.limit) query = query.limit(filters.limit)
      const { data } = await query
      return data ? mapArrayToCamel(data) : []
    },
    async getArticle(id) {
      const { data } = await getClient().from('articles').select('*').eq('id', id).single()
      return data ? mapKeysToCamel(data) : null
    },
    async getArticleByUrl(url) {
      const { data } = await getClient().from('articles').select('*').or(`url.eq.${url},canonical_url.eq.${url}`).maybeSingle()
      return data ? mapKeysToCamel(data) : null
    },
    async createArticle(input) {
      const { data } = await getClient().from('articles').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },
    async updateArticle(id, updates) {
      const { data } = await getClient().from('articles').update(mapKeysToSnake(updates as Record<string, unknown>)).eq('id', id).select().single()
      return data ? mapKeysToCamel(data) : null
    },

    async getExtraction(articleId) {
      const { data } = await getClient().from('article_extractions').select('*').eq('article_id', articleId).maybeSingle()
      return data ? mapKeysToCamel(data) : null
    },
    async createExtraction(input) {
      const { data } = await getClient().from('article_extractions').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },

    async getIdeasForArticle(articleId) {
      const { data } = await getClient().from('ideas').select('*').eq('article_id', articleId)
      return data ? mapArrayToCamel(data) : []
    },
    async createIdea(input) {
      const { data } = await getClient().from('ideas').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },

    async getBaskets() {
      const { data } = await getClient().from('baskets').select('*').order('created_at', { ascending: false })
      return data ? mapArrayToCamel(data) : []
    },
    async getBasket(id) {
      const { data } = await getClient().from('baskets').select('*').eq('id', id).single()
      return data ? mapKeysToCamel(data) : null
    },
    async createBasket(input) {
      const { data } = await getClient().from('baskets').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },
    async deleteBasket(id) {
      const { count } = await getClient().from('baskets').delete().eq('id', id)
      return (count ?? 0) > 0
    },

    async getBasketMembers(basketId) {
      const { data } = await getClient().from('basket_members').select('*').eq('basket_id', basketId)
      return data ? mapArrayToCamel(data) : []
    },
    async addBasketMember(input) {
      const { data } = await getClient().from('basket_members').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },
    async removeBasketMember(id) {
      const { count } = await getClient().from('basket_members').delete().eq('id', id)
      return (count ?? 0) > 0
    },

    async getWatchlist() {
      const { data } = await getClient().from('watchlist').select('*').order('created_at', { ascending: false })
      return data ? mapArrayToCamel(data) : []
    },
    async getWatchlistItem(ticker) {
      const { data } = await getClient().from('watchlist').select('*').eq('ticker', ticker.toUpperCase()).maybeSingle()
      return data ? mapKeysToCamel(data) : null
    },
    async addWatchlistItem(input) {
      const { data } = await getClient().from('watchlist').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },
    async removeWatchlistItem(id) {
      const { count } = await getClient().from('watchlist').delete().eq('id', id)
      return (count ?? 0) > 0
    },

    async getMetricsSnapshot(ticker) {
      const { data } = await getClient().from('metrics_snapshots').select('*').eq('ticker', ticker.toUpperCase()).order('snapshot_date', { ascending: false }).limit(1).maybeSingle()
      return data ? mapKeysToCamel(data) : null
    },
    async saveMetricsSnapshot(input) {
      const { data } = await getClient().from('metrics_snapshots').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },

    async createFeedback(input) {
      const { data } = await getClient().from('user_feedback').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },

    async createScanRun(input) {
      const { data } = await getClient().from('scan_runs').insert(mapKeysToSnake(input as Record<string, unknown>)).select().single()
      return mapKeysToCamel(data!)
    },
    async updateScanRun(id, updates) {
      const { data } = await getClient().from('scan_runs').update(mapKeysToSnake(updates as Record<string, unknown>)).eq('id', id).select().single()
      return data ? mapKeysToCamel(data) : null
    },

    async isSeeded() {
      const { data } = await getClient().from('scan_runs').select('id').limit(1).maybeSingle()
      return data !== null
    },
    async markSeeded() {
      // no-op for Supabase; seeding handled by migration
    },
  }
  return store
}
