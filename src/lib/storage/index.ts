import type { Store } from './types'
import { createJsonStore } from './jsonStore'
import { createSupabaseStore } from './supabaseStore'

let store: Store | null = null

export function getStore(): Store {
  if (store) return store

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    store = createSupabaseStore()
  } else if (process.env.NODE_ENV === 'development') {
    store = createJsonStore()
  } else {
    throw new Error(
      'Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables. ' +
      'JSON file store is only available in development mode.'
    )
  }

  return store
}

export type { Store }
export * from './types'
