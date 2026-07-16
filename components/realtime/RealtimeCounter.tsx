'use client'

import { useEffect, useRef, useState } from 'react'
import { formatCOP } from '@/lib/utils/format'

interface AnimatedCounterProps {
  value: number
  format?: (v: number) => string
  className?: string
}

export function AnimatedCounter({ value, format = String, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    if (start === end) return

    let startTime: number | null = null
    const duration = 800

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
      else prevRef.current = end
    }

    requestAnimationFrame(step)
  }, [value])

  return <span className={className}>{format(display)}</span>
}

interface RealtimeCounterProps {
  initial: number
  campaignId: string
  className?: string
}

export default function RealtimeCounter({ initial, campaignId, className }: RealtimeCounterProps) {
  const [amount, setAmount] = useState(initial)

  useEffect(() => {
    // Import dynamically to avoid SSR issues
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      const channel = supabase
        .channel(`campaign-donations-${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'campaigns',
            filter: `id=eq.${campaignId}`,
          },
          (payload) => {
            if (payload.new && typeof payload.new.collected_amount === 'number') {
              setAmount(payload.new.collected_amount)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }, [campaignId])

  return (
    <AnimatedCounter
      value={amount}
      format={formatCOP}
      className={className}
    />
  )
}
