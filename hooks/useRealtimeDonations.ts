'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Donation } from '@/lib/supabase/types'

export function useRealtimeDonations(campaignId: string, initial: Donation[]) {
  const [donations, setDonations] = useState(initial)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`donations-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'donations',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          if (payload.new?.status === 'approved') {
            setDonations((prev) => {
              const exists = prev.find(d => d.id === payload.new.id)
              if (exists) {
                return prev.map(d => d.id === payload.new.id ? payload.new as Donation : d)
              }
              return [payload.new as Donation, ...prev]
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [campaignId])

  return donations
}
