import type { Store } from './types'
import { createJsonStore } from './jsonStore'
import { createSupabaseStore } from './supabaseStore'

let store: Store | null = null

export function getStore(): Store {
  if (store) return store

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    store = createSupabaseStore()
  } else {
    store = createJsonStore()
  }

  return store
}

export type { Store }
export * from './types'
