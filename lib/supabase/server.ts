import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

const DEMO_URL = 'https://demo.supabase.co'
const DEMO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo'

function getSupabaseConfig(serviceRole = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const isValid = url.startsWith('https://') && url.includes('supabase')
  return {
    url: isValid ? url : DEMO_URL,
    key: isValid ? (serviceRole ? serviceKey : anonKey) : DEMO_KEY,
  }
}

export function createClient() {
  const cookieStore = cookies()
  const { url, key } = getSupabaseConfig()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

export function createServiceClient() {
  const { url, key } = getSupabaseConfig(true)
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() { return [] },
      setAll() {},
    },
  })
}
