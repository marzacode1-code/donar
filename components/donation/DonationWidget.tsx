'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCOP } from '@/lib/utils/format'
import type { Campaign, Profile } from '@/lib/supabase/types'

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000]

interface DonationWidgetProps {
  campaign: Campaign
  currentUser: Profile | null
}

export default function DonationWidget({ campaign, currentUser }: DonationWidgetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState(currentUser?.full_name || '')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amount = selectedAmount || (customAmount ? parseInt(customAmount.replace(/\D/g, '')) : 0)
  const isDisabled = campaign.status !== 'active' && campaign.status !== 'executing'

  const handleDonate = async () => {
    if (amount < 1000) {
      setError('El monto mínimo es $1.000 COP')
      return
    }
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      // Create pending donation
      const { data: donation, error: dbError } = await supabase
        .from('donations')
        .insert({
          campaign_id: campaign.id,
          donor_id: currentUser?.id || null,
          amount,
          donor_name: isAnonymous ? null : (donorName || 'Donante anónimo'),
          donor_message: message || null,
          is_anonymous: isAnonymous,
          status: 'pending',
        })
        .select()
        .single()

      if (dbError || !donation) throw new Error('Error al crear la donación')

      // Redirect to Wompi
      const reference = donation.id
      const redirectUrl = `${window.location.origin}/campaigns/${campaign.slug}/success?reference=${reference}`

      const wompiUrl = new URL('https://checkout.wompi.co/p/')
      wompiUrl.searchParams.set('public-key', process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '')
      wompiUrl.searchParams.set('currency', 'COP')
      wompiUrl.searchParams.set('amount-in-cents', String(amount * 100))
      wompiUrl.searchParams.set('reference', reference)
      wompiUrl.searchParams.set('redirect-url', redirectUrl)

      window.location.href = wompiUrl.toString()
    } catch {
      setError('Hubo un error. Intenta nuevamente.')
      setLoading(false)
    }
  }

  if (isDisabled) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Esta campaña no está recibiendo donaciones en este momento.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card p-6 border border-gray-100"
    >
      <h3 className="font-bold text-secondary text-lg mb-5">Aportar a esta causa</h3>

      {/* Preset amounts */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRESET_AMOUNTS.map((preset) => (
          <motion.button
            key={preset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setSelectedAmount(preset); setCustomAmount('') }}
            className={`py-3 rounded-xl font-semibold text-sm transition-all ${
              selectedAmount === preset
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary/50 hover:bg-primary-50'
            }`}
          >
            {formatCOP(preset)}
          </motion.button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 font-medium mb-1.5 block">Otro monto (COP)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
          <input
            type="text"
            placeholder="0"
            value={customAmount}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '')
              setCustomAmount(raw)
              setSelectedAmount(null)
            }}
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
          />
        </div>
        {amount > 0 && (
          <p className="text-xs text-gray-400 mt-1">Monto: {formatCOP(amount)}</p>
        )}
      </div>

      {/* Donor info */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1.5 block">Tu nombre (opcional)</label>
          <input
            type="text"
            placeholder="¿Cómo quieres que te reconozcamos?"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            disabled={isAnonymous}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1.5 block">Mensaje (opcional)</label>
          <textarea
            placeholder="Deja un mensaje de aliento..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="accent-primary w-4 h-4"
          />
          <span className="text-sm text-gray-600">Donar de forma anónima</span>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleDonate}
        disabled={loading || amount < 1000}
        className="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <>
            <Heart className="w-5 h-5 fill-white" />
            {amount > 0 ? `Aportar ${formatCOP(amount)}` : 'Aportar a esta Causa'}
          </>
        )}
      </motion.button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
        <Lock className="w-3.5 h-3.5" />
        Donación segura vía Wompi/PSE
      </div>
    </motion.div>
  )
}
