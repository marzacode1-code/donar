'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Eye, TrendingUp, Shield, Clock, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCOP, timeAgo } from '@/lib/utils/format'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Campaign, PlatformStats } from '@/lib/supabase/types'

interface AdminClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pending: any[]
  allCampaigns: Campaign[]
  stats: PlatformStats | null
}

export default function AdminClient({ pending: initialPending, allCampaigns, stats }: AdminClientProps) {
  const [pending, setPending] = useState(initialPending)
  const [tab, setTab] = useState<'pending' | 'all' | 'stats'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    const supabase = createClient()
    await supabase.from('campaigns').update({ status: 'active' }).eq('id', id)
    setPending(prev => prev.filter(c => c.id !== id))
    setProcessingId(null)
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason) return
    setProcessingId(id)
    const supabase = createClient()
    await supabase.from('campaigns').update({ status: 'rejected', rejection_reason: rejectionReason }).eq('id', id)
    setPending(prev => prev.filter(c => c.id !== id))
    setProcessingId(null)
    setRejectingId(null)
    setRejectionReason('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-black text-secondary">Panel de Administración</h1>
          <p className="text-gray-500 text-sm">Control total de DonaTech</p>
        </div>
      </div>

      {/* Stats banner */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total recaudado', value: formatCOP(stats.total_collected), icon: TrendingUp, color: 'text-success' },
            { label: 'Campañas activas', value: stats.active_campaigns, icon: CheckCircle, color: 'text-primary' },
            { label: 'Donaciones totales', value: stats.total_donations, icon: Clock, color: 'text-blue-500' },
            { label: 'Usuarios', value: stats.total_users, icon: Users, color: 'text-secondary' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-card">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-black text-secondary tabular-nums">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Commission note */}
      {stats && stats.total_collected > 0 && (
        <div className="bg-accent-50 border border-accent/30 rounded-xl px-4 py-3 mb-6 text-sm text-accent-600 font-medium">
          Comisión plataforma (5%): <strong>{formatCOP(Math.round(stats.total_collected * 0.05))}</strong>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 max-w-sm">
        {(['pending', 'all', 'stats'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-secondary'
            }`}
          >
            {t === 'pending' ? `Pendientes (${pending.length})` : t === 'all' ? 'Todas' : 'Estadísticas'}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-card">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="font-bold text-secondary mb-1">¡Todo al día!</h3>
              <p className="text-gray-500 text-sm">No hay campañas pendientes de revisión.</p>
            </div>
          ) : (
            pending.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-6 shadow-card"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={campaign.status} />
                      <span className="text-xs text-gray-400">{timeAgo(campaign.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-secondary text-lg">{campaign.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {campaign.city}, {campaign.department} • Meta: {formatCOP(campaign.goal_amount)}
                    </p>
                    {campaign.profiles && (
                      <p className="text-xs text-gray-400 mt-1">
                        Creador: {campaign.profiles.full_name} ({campaign.profiles.email})
                        {campaign.profiles.kyc_document_url && (
                          <span className="ml-2 text-blue-600">• Tiene KYC</span>
                        )}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">{campaign.description}</p>
                  </div>

                  <div className="flex flex-col gap-2 md:flex-shrink-0">
                    <a
                      href={`/campaigns/${campaign.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-primary/50 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Ver detalle
                    </a>
                    <button
                      onClick={() => handleApprove(campaign.id)}
                      disabled={processingId === campaign.id}
                      className="flex items-center gap-1.5 text-sm px-4 py-2 bg-success text-white rounded-lg hover:bg-success-600 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Aprobar
                    </button>
                    <button
                      onClick={() => setRejectingId(campaign.id)}
                      className="flex items-center gap-1.5 text-sm px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Rechazar
                    </button>
                  </div>
                </div>

                {rejectingId === campaign.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-100"
                  >
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Motivo de rechazo</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      placeholder="Explica por qué esta campaña no cumple los requisitos..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(campaign.id)}
                        disabled={!rejectionReason || processingId === campaign.id}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        Confirmar rechazo
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectionReason('') }}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-500">Campaña</th>
                  <th className="text-left p-4 font-semibold text-gray-500">Estado</th>
                  <th className="text-right p-4 font-semibold text-gray-500">Recaudado</th>
                  <th className="text-right p-4 font-semibold text-gray-500">Meta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <a href={`/campaigns/${campaign.slug}`} target="_blank" className="font-medium text-secondary hover:text-primary transition-colors line-clamp-1">
                        {campaign.title}
                      </a>
                      <p className="text-xs text-gray-400">{campaign.city}, {campaign.department}</p>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="p-4 text-right font-semibold text-primary tabular-nums">
                      {formatCOP(campaign.collected_amount)}
                    </td>
                    <td className="p-4 text-right text-gray-500 tabular-nums">
                      {formatCOP(campaign.goal_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
