'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'

interface Toast {
  id: string
  name: string
  amount: number
}

interface DonationToastProps {
  campaignId: string
}

export default function DonationToast({ campaignId }: DonationToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id))
    }, 5000)
  }, [])

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      const channel = supabase
        .channel(`donation-toasts-${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'donations',
            filter: `campaign_id=eq.${campaignId}`,
          },
          (payload) => {
            if (payload.new?.status === 'approved' && payload.old?.status !== 'approved') {
              const name = payload.new.is_anonymous ? 'Alguien' : (payload.new.donor_name || 'Un donante')
              addToast({
                id: payload.new.id,
                name,
                amount: payload.new.amount,
              })
            }
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    })
  }, [campaignId, addToast])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-white border border-gray-100 shadow-card-hover rounded-xl px-4 py-3 flex items-center gap-3 min-w-64"
          >
            <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">¡Nueva donación!</p>
              <p className="text-sm font-semibold text-secondary">
                {toast.name} aportó {formatCOP(toast.amount)}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
