import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

const DEMO_URL = 'https://demo.supabase.co'
const DEMO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo'

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const isValid = url.startsWith('https://') && url.includes('supabase')
  return {
    url: isValid ? url : DEMO_URL,
    key: isValid ? key : DEMO_KEY,
  }
}

export function createClient() {
  const { url, key } = getSupabaseConfig()
  return createBrowserClient<Database>(url, key)
}
