import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let supabaseInstance: SupabaseClient | null = null
let neonInstance: NeonQueryFunction<boolean, boolean> | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }
    supabaseInstance = createClient(url, key)
  }
  return supabaseInstance
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase admin environment variables')
  }
  return createClient(url, key)
}

export function getNeon(): NeonQueryFunction<boolean, boolean> {
  if (!neonInstance) {
    const connectionString = process.env.NEON_CONNECTION_STRING
    if (!connectionString) {
      throw new Error('Missing NEON_CONNECTION_STRING environment variable')
    }
    neonInstance = neon(connectionString)
  }
  return neonInstance
}
