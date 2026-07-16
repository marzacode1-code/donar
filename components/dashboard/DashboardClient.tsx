'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, Heart, Clock, CheckCircle, Upload } from 'lucide-react'
import ProgressBar from '@/components/campaigns/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import TraceabilityUploadModal from './TraceabilityUploadModal'
import { formatCOP, timeAgo } from '@/lib/utils/format'
import type { Campaign, Donation, Profile } from '@/lib/supabase/types'

interface DashboardClientProps {
  profile: Profile | null
  campaigns: Campaign[]
  donations: Donation[]
}

export default function DashboardClient({ profile, campaigns, donations }: DashboardClientProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  const totalRaised = campaigns.reduce((s, c) => s + c.collected_amount, 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'executing').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <Image src={profile.avatar_url} alt="" width={56} height={56} className="rounded-full border-2 border-gray-100" />
          )}
          <div>
            <h1 className="text-2xl font-black text-secondary">Hola, {profile?.full_name?.split(' ')[0] || 'Creador'}</h1>
            <p className="text-gray-500 text-sm">Gestiona tus campañas y trazabilidad</p>
          </div>
        </div>
        <Link
          href="/create-campaign"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" /> Nueva campaña
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total recaudado', value: formatCOP(totalRaised), icon: TrendingUp, color: 'text-success' },
          { label: 'Campañas activas', value: activeCampaigns, icon: Heart, color: 'text-primary' },
          { label: 'Donaciones recibidas', value: donations.length, icon: CheckCircle, color: 'text-blue-500' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <div className="text-2xl font-black text-secondary tabular-nums">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaigns */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-secondary mb-4">Mis campañas</h2>
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-card">
              <span className="text-4xl block mb-3">🚀</span>
              <h3 className="font-bold text-secondary mb-2">Crea tu primera campaña</h3>
              <p className="text-gray-500 text-sm mb-4">Conecta tu causa con cientos de donantes en Colombia.</p>
              <Link href="/create-campaign" className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors inline-block">
                Crear campaña
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <StatusBadge status={campaign.status} />
                      </div>
                      <h3 className="font-bold text-secondary line-clamp-1">{campaign.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/campaigns/${campaign.slug}`}
                        className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-primary/50 transition-colors"
                      >
                        Ver
                      </Link>
                      {(campaign.status === 'active' || campaign.status === 'executing') && (
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="flex items-center gap-1 text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Actualizar
                        </button>
                      )}
                    </div>
                  </div>
                  <ProgressBar
                    collected={campaign.collected_amount}
                    goal={campaign.goal_amount}
                    size="sm"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent donations */}
        <div>
          <h2 className="text-lg font-bold text-secondary mb-4">Donaciones recientes</h2>
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {donations.length === 0 ? (
              <div className="p-6 text-center">
                <Heart className="w-8 h-8 text-gray-200 mx-auto mb-2 fill-current" />
                <p className="text-gray-400 text-sm">Las donaciones aparecerán aquí</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {donations.slice(0, 10).map((donation) => {
                  const campaign = campaigns.find(c => c.id === donation.campaign_id)
                  const name = donation.is_anonymous ? 'Anónimo' : (donation.donor_name || 'Donante')
                  return (
                    <div key={donation.id} className="flex items-center gap-3 p-4">
                      <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {donation.is_anonymous ? '?' : name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-secondary truncate">{name}</p>
                        {campaign && <p className="text-xs text-gray-400 truncate">{campaign.title}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary tabular-nums">{formatCOP(donation.amount)}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-0.5 justify-end">
                          <Clock className="w-3 h-3" />{timeAgo(donation.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traceability upload modal */}
      {selectedCampaign && (
        <TraceabilityUploadModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  )
}
