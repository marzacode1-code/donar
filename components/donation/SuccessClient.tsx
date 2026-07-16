'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Heart, Share2, ArrowRight, XCircle } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'

interface SuccessClientProps {
  donation: { id: string; amount: number; status: string; donor_name?: string | null } | null
  campaign: { title: string; slug: string } | null
}

export default function SuccessClient({ donation, campaign }: SuccessClientProps) {
  useEffect(() => {
    if (donation?.status === 'approved') {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#E84545', '#F4A261', '#2EC4B6', '#2B2D42'],
        })
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 120,
            origin: { y: 0.4, x: 0.2 },
          })
          confetti({
            particleCount: 80,
            spread: 120,
            origin: { y: 0.4, x: 0.8 },
          })
        }, 400)
      })
    }
  }, [donation?.status])

  const handleShare = () => {
    if (navigator.share && campaign) {
      navigator.share({
        title: `Acabo de donar a "${campaign.title}" en DonaTech`,
        text: `¡Acabo de aportar ${donation?.amount ? formatCOP(donation.amount) : ''} a una causa que lo necesita! Únete tú también.`,
        url: `${window.location.origin}/campaigns/${campaign.slug}`,
      })
    }
  }

  const isApproved = donation?.status === 'approved'
  const isDeclined = donation?.status === 'declined'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-primary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {isApproved ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-success" />
            </motion.div>

            <h1 className="text-3xl font-black text-secondary mb-2">¡Gracias!</h1>
            <p className="text-gray-500 mb-6">Tu donación fue procesada exitosamente</p>

            {donation && (
              <div className="bg-primary-50 rounded-2xl p-5 mb-6">
                <div className="text-3xl font-black text-primary tabular-nums mb-1">
                  {formatCOP(donation.amount)}
                </div>
                {campaign && (
                  <p className="text-secondary text-sm font-medium">
                    aportados a <strong>&ldquo;{campaign.title}&rdquo;</strong>
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
              <Heart className="w-5 h-5 text-primary mx-auto mb-2 fill-current" />
              Tu dinero va directo a la ejecución del proyecto. Recibirás actualizaciones con evidencias del impacto real.
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full bg-secondary text-white py-3 rounded-xl font-semibold hover:bg-secondary-600 transition-colors"
              >
                <Share2 className="w-5 h-5" /> Compartir en redes
              </button>
              {campaign && (
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="flex items-center justify-center gap-2 w-full bg-primary-50 text-primary py-3 rounded-xl font-semibold hover:bg-primary-100 transition-colors"
                >
                  Ver la campaña <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="/campaigns"
                className="text-gray-400 hover:text-secondary text-sm transition-colors"
              >
                Explorar más causas
              </Link>
            </div>
          </>
        ) : isDeclined ? (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-secondary mb-2">Pago no procesado</h1>
            <p className="text-gray-500 mb-6">El pago fue declinado. Intenta con otro método de pago.</p>
            {campaign && (
              <Link
                href={`/campaigns/${campaign.slug}`}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors inline-block"
              >
                Intentar de nuevo
              </Link>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <h1 className="text-2xl font-black text-secondary mb-2">Procesando pago</h1>
            <p className="text-gray-500 mb-6">Tu donación está siendo verificada. Te notificaremos cuando esté confirmada.</p>
            <Link href="/campaigns" className="text-primary font-semibold hover:underline">
              Explorar más campañas
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}
